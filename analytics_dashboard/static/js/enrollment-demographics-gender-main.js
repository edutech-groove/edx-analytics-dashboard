/**
 * This is the first script called by the enrollment demographics gender page.  It loads
 * the libraries and kicks off the application.
 */

require(['load/init-page'], function(page) {
    'use strict';

    require(['underscore', 'views/data-table-view', 'views/discrete-bar-view'],
        function(_, DataTableView, DiscreteBarView) {
            var genderChart = new DiscreteBarView({
                    el: '#enrollment-chart-view',
                    model: page.models.courseModel,
                    modelAttribute: 'genders',
                    dataType: 'percent',
                    trends: [{
                        title: gettext('Percentage'),
                        color: '#38C976'
                    }],
                    x: {key: 'gender'},
                    y: {key: 'percent'},
                    // Translators: <%=value%> will be replaced with a level of gender (e.g. Female).
                    interactiveTooltipHeaderTemplate: _.template(gettext('Gender: <%=value%>'))
                }),
                // Daily enrollment table
                genderTable = new DataTableView({
                    el: '[data-role=enrollment-table]',
                    model: page.models.courseModel,
                    modelAttribute: 'genderTrend',
                    columns: [
                        {key: 'date', title: gettext('Date'), type: 'date'},
                        {key: 'total', title: gettext('Current Enrollment'), type: 'number', className: 'text-right strong'},
                        {key: 'female', title: gettext('Female'), type: 'number', className: 'text-right strong'},
                        {key: 'male', title: gettext('Male'), type: 'number', className: 'text-right strong'},
                        {key: 'other', title: gettext('Other'), type: 'number', className: 'text-right strong'},
                        {key: 'unknown', title: gettext('Not Reported'), type: 'number', className: 'text-right strong'}
                    ],
                    sorting: ['-date']
                });

            genderChart.renderIfDataAvailable();
            genderTable.renderIfDataAvailable();
        });
});
