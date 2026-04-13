

annotate LeaveService.LeaveRequests with @(
  UI.LineItem: [
    { Value: employee.name,  Label: 'Employee' },
    { Value: startDate,    Label: 'Start Date'  },
    { Value: endDate,      Label: 'End Date'    },
    { Value: days,         Label: 'Days'        },
    { Value: reason,       Label: 'Reason'      },
    { Value: status,       Label: 'Status'      },
    { Value: reviewedBy,   Label: 'Reviewed By' }
  ],
  UI.HeaderInfo: {
    TypeName: 'Leave Request',
    TypeNamePlural: 'Leave Requests'
  }
);