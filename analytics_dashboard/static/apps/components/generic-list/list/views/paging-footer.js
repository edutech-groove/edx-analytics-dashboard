/**
 * Class for the pagination footer, which needs to set focus to
 * the top of the table after being clicked.
 */
define(function(require) {
    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backgrid = require('backgrid'),

        pageHandleTemplate = require('components/generic-list/list/templates/page-handle.underscore'),

        PagingFooter;

    // backgrid-paginator attaches itself to 'Backgrid.Extension'
    require('backgrid-paginator');

    PagingFooter = Backgrid.Extension.Paginator.extend({
        tagName: 'nav',
        attributes: {
            'aria-label': 'Pagination'
        },
        controls: {
            rewind: {title: 'First', label: '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="9" viewBox="0 0 8 9"><g transform="translate(3 9) rotate(-90)"><path class="a" d="M4.5,0a.5.5,0,0,0-.354.147l-4,4a.5.5,0,0,0,.707.707L4.5,1.207,8.146,4.854a.5.5,0,0,0,.707-.707l-4-4A.5.5,0,0,0,4.5,0Z"/></g><g transform="translate(0 9) rotate(-90)"><path class="a" d="M4.5,0a.5.5,0,0,0-.354.147l-4,4a.5.5,0,0,0,.707.707L4.5,1.207,8.146,4.854a.5.5,0,0,0,.707-.707l-4-4A.5.5,0,0,0,4.5,0Z"/></g></svg>'},
            back: {title: 'Previous', label: '<svg xmlns="http://www.w3.org/2000/svg" width="5" height="9" viewBox="0 0 5 9"><g transform="translate(0 9) rotate(-90)"><path class="a" d="M4.5,0a.5.5,0,0,0-.354.147l-4,4a.5.5,0,0,0,.707.707L4.5,1.207,8.146,4.854a.5.5,0,0,0,.707-.707l-4-4A.5.5,0,0,0,4.5,0Z"/></g></svg>'},
            forward: {title: 'Next', label: '<svg xmlns="http://www.w3.org/2000/svg" width="5" height="9" viewBox="0 0 5 9"><g transform="translate(-390.547 424.663) rotate(-90)"><path class="a" d="M420.164,395.547a.5.5,0,0,1-.354-.147l-4-4a.5.5,0,1,1,.707-.707l3.647,3.647,3.646-3.647a.5.5,0,0,1,.707.707l-4,4A.5.5,0,0,1,420.164,395.547Z"/></g></svg>'},
            fastForward: {title: 'Last', label: '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="9" viewBox="0 0 8 9"><g transform="translate(-563 -755)"><g transform="translate(172.453 1179.663) rotate(-90)"><path class="a" d="M420.164,395.547a.5.5,0,0,1-.354-.147l-4-4a.5.5,0,1,1,.707-.707l3.647,3.647,3.646-3.647a.5.5,0,0,1,.707.707l-4,4A.5.5,0,0,1,420.164,395.547Z"/></g><g transform="translate(175.453 1179.663) rotate(-90)"><path class="a" d="M420.164,395.547a.5.5,0,0,1-.354-.147l-4-4a.5.5,0,1,1,.707-.707l3.647,3.647,3.646-3.647a.5.5,0,0,1,.707.707l-4,4A.5.5,0,0,1,420.164,395.547Z"/></g></g></svg>'}
        },
        initialize: function(options) {
            Backgrid.Extension.Paginator.prototype.initialize.call(this, options);
            this.options = options || {};
            this.appFocusable = $('#' + options.appClass + '-focusable');
            this.trackPageEventName = options.trackPageEventName || 'edx.bi.list.paged';
        },
        render: function() {
            var trackingModel = this.options.trackingModel,
                appFocusable = this.appFocusable,
                trackPageEventName = this.trackPageEventName;
            Backgrid.Extension.Paginator.prototype.render.call(this);

            // Pass the tracking model to the page handles so that they can trigger tracking event. Also passes the
            // focusable div that jumps the user to the top of the page and the tracking event name.
            // We have to do it in this awkward way because the pageHandle class cannot access the `this` scope of this
            // overall PagingFooter class.
            _(this.handles).each(function(handle) {
                /* eslint-disable no-param-reassign */
                handle.trackingModel = trackingModel;
                handle.appFocusable = appFocusable;
                handle.trackPageEventName = trackPageEventName;
                /* eslint-enable no-param-reassign */
            });
        },

        /**
         * NOTE: this PageHandle class is a subclass of PagingFooter. The `changePage` function is called internally by
         * Backgrid when the page handle is clicked by the user. We add some side-effects to the `changePage` function
         * here: sending a tracking event and refocusing the browser to the top of the table. This subclass needs
         * variables from the encompassing PagingFooter class in order to perform those side-effects and we pass them
         * down from the PagingFooter in its render function above.
         */
        pageHandle: Backgrid.Extension.PageHandle.extend({
            template: _.template(pageHandleTemplate),
            trackingModel: undefined,  // set by PagingFooter
            render: function() {
                var isHiddenFromSr = true,
                    srText;
                Backgrid.Extension.PageHandle.prototype.render.apply(this, arguments);
                if (this.isRewind) {
                    srText = gettext('first page');
                } else if (this.isBack) {
                    srText = gettext('previous page');
                } else if (this.isForward) {
                    srText = gettext('next page');
                } else if (this.isFastForward) {
                    srText = gettext('last page');
                } else {
                    srText = gettext('page');
                    isHiddenFromSr = false;
                }
                this.$el.html(this.template({
                    title: this.title,
                    srText: srText,
                    isHiddenFromSr: isHiddenFromSr,
                    nonSrText: this.label,
                    isDisabled: this.$el.hasClass('disabled'),
                    // Translators: describes the state of a pagination button as not clickable
                    disabledText: gettext('disabled'),
                    isActive: this.$el.hasClass('active'),
                    // Translators: describes a pagination button as representing the current page
                    activeText: gettext('active'),
                    isButton: this.isRewind || this.isBack || this.isForward || this.isFastForward
                }));
                this.delegateEvents();
                return this;
            },
            changePage: function() {
                Backgrid.Extension.PageHandle.prototype.changePage.apply(this, arguments);
                if (!this.$el.hasClass('active') && !this.$el.hasClass('disabled')) {
                    this.appFocusable.focus();
                } else {
                    this.$('a').focus();
                }
                this.trackingModel.trigger('segment:track', this.trackPageEventName, {
                    category: this.pageIndex
                });
            }
        })
    });

    return PagingFooter;
});
