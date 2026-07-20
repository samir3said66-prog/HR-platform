# Admin Guide - HR Analytics Platform

## Administration Overview

This guide provides system administrators with the information needed to manage, configure, and maintain the HR Analytics Platform.

## User Management

### Creating Users

1. Navigate to **Admin** → **User Management**
2. Click **Add User**
3. Enter user details:
   - Username (unique)
   - Email address
   - Full name
   - Department
   - Role (see Roles section below)
4. Click **Create User**
5. System generates temporary password and sends via email

### Editing Users

1. Navigate to **Admin** → **User Management**
2. Find user in the list
3. Click **Edit**
4. Update user details
5. Click **Save**

### Deactivating Users

1. Navigate to **Admin** → **User Management**
2. Find user in the list
3. Click **Deactivate**
4. Confirm deactivation
5. User loses access immediately

### Resetting Passwords

1. Navigate to **Admin** → **User Management**
2. Find user in the list
3. Click **Reset Password**
4. System generates temporary password
5. Password is sent to user's email

## Role-Based Access Control (RBAC)

### Available Roles

#### Admin
- Full system access
- User management
- System configuration
- Audit log access
- Backup management

#### HR Manager
- View all employee data
- Create/edit/delete employees
- Manage performance ratings
- Generate reports
- Export data

#### Department Manager
- View employees in their department
- View performance data for their team
- Generate department reports
- Cannot edit employee data

#### Employee
- View own profile
- View own performance data
- Cannot view other employees
- Cannot generate reports

#### Analyst
- View all data
- Generate reports
- Export data
- Cannot modify data

### Assigning Roles

1. Navigate to **Admin** → **User Management**
2. Find user in the list
3. Click **Edit**
4. Select role from dropdown
5. Click **Save**

### Creating Custom Roles

1. Navigate to **Admin** → **Roles**
2. Click **Create Role**
3. Enter role name
4. Select permissions:
   - View employees
   - Edit employees
   - Delete employees
   - View performance
   - Edit performance
   - Generate reports
   - Export data
   - Manage users
   - View audit logs
5. Click **Create**

## System Configuration

### Email Configuration

1. Navigate to **Admin** → **Settings** → **Email**
2. Configure SMTP settings:
   - SMTP Server
   - SMTP Port
   - Username
   - Password
   - From Address
3. Click **Test Connection** to verify
4. Click **Save**

### Backup Configuration

1. Navigate to **Admin** → **Settings** → **Backup**
2. Configure backup settings:
   - Backup frequency (daily/weekly/monthly)
   - Backup time
   - Retention period (days)
   - Backup location
3. Click **Save**

### API Configuration

1. Navigate to **Admin** → **Settings** → **API**
2. Configure API settings:
   - API endpoint URL
   - API timeout (seconds)
   - Rate limiting (requests/minute)
   - API keys
3. Click **Save**

### WebSocket Configuration

1. Navigate to **Admin** → **Settings** → **WebSocket**
2. Configure WebSocket settings:
   - WebSocket server URL
   - Connection timeout (seconds)
   - Reconnection attempts
   - Reconnection delay (seconds)
3. Click **Save**

## Monitoring & Maintenance

### System Health

1. Navigate to **Admin** → **Monitoring** → **System Health**
2. View:
   - Server status
   - Database status
   - API status
   - WebSocket status
   - Disk space usage
   - Memory usage
   - CPU usage

### Performance Metrics

1. Navigate to **Admin** → **Monitoring** → **Performance**
2. View:
   - Average response time
   - Requests per second
   - Error rate
   - Active users
   - Database query performance

### Error Logs

1. Navigate to **Admin** → **Monitoring** → **Error Logs**
2. View error details:
   - Timestamp
   - Error message
   - Stack trace
   - User (if applicable)
3. Filter by:
   - Date range
   - Error type
   - Severity level

### Audit Logs

1. Navigate to **Admin** → **Audit Logs**
2. View all user actions:
   - Timestamp
   - User ID
   - Action (view, edit, delete, export)
   - Resource affected
   - Changes made
3. Filter by:
   - Date range
   - User
   - Action type
   - Resource type

**Export Audit Logs**:
1. Click **Export**
2. Choose format (CSV, Excel, PDF)
3. Select date range
4. Click **Export**

## Backup & Disaster Recovery

### Manual Backup

1. Navigate to **Admin** → **Backup** → **Manual Backup**
2. Click **Create Backup**
3. Enter backup name
4. Click **Create**
5. Backup is created and stored

### Viewing Backups

1. Navigate to **Admin** → **Backup** → **Backups**
2. View list of all backups:
   - Backup name
   - Creation date
   - Size
   - Status

### Restoring from Backup

1. Navigate to **Admin** → **Backup** → **Backups**
2. Find backup to restore
3. Click **Restore**
4. Confirm restoration
5. System restores from backup
6. All users are logged out during restoration

### Backup Verification

1. Navigate to **Admin** → **Backup** → **Verification**
2. Click **Verify All Backups**
3. System checks backup integrity
4. View verification results

## Data Management

### Data Import

1. Navigate to **Admin** → **Data Management** → **Import**
2. Select import type:
   - Employee data
   - Performance data
   - Historical data
3. Upload CSV file
4. Map columns to database fields
5. Click **Import**
6. View import results

### Data Export

1. Navigate to **Admin** → **Data Management** → **Export**
2. Select data to export:
   - All employees
   - Performance data
   - Audit logs
3. Choose format (CSV, Excel)
4. Click **Export**

### Data Cleanup

1. Navigate to **Admin** → **Data Management** → **Cleanup**
2. Select cleanup task:
   - Remove inactive users
   - Archive old records
   - Delete temporary data
3. Click **Preview** to see what will be deleted
4. Click **Execute** to run cleanup

## Security Management

### Password Policy

1. Navigate to **Admin** → **Security** → **Password Policy**
2. Configure:
   - Minimum length
   - Require uppercase
   - Require numbers
   - Require special characters
   - Expiration period (days)
3. Click **Save**

### Session Management

1. Navigate to **Admin** → **Security** → **Sessions**
2. View active sessions:
   - User
   - Login time
   - Last activity
   - IP address
3. Click **Terminate Session** to force logout

### Two-Factor Authentication

1. Navigate to **Admin** → **Security** → **2FA**
2. Enable/disable 2FA
3. Choose 2FA method:
   - Email
   - SMS
   - Authenticator app
4. Click **Save**

### API Keys

1. Navigate to **Admin** → **Security** → **API Keys**
2. View existing API keys
3. Click **Generate New Key** to create new key
4. Copy key (only shown once)
5. Click **Revoke** to disable key

## Troubleshooting

### High Memory Usage

1. Check **Admin** → **Monitoring** → **System Health**
2. Identify memory-consuming processes
3. Restart application if necessary
4. Check for memory leaks in logs

### Slow Performance

1. Check database query performance in **Monitoring**
2. Optimize slow queries
3. Check server resources
4. Consider scaling infrastructure

### WebSocket Connection Issues

1. Verify WebSocket server is running
2. Check WebSocket configuration
3. Review error logs
4. Check network connectivity

### Backup Failures

1. Check backup logs
2. Verify backup storage has sufficient space
3. Check database connectivity
4. Verify backup permissions

### Email Not Sending

1. Verify SMTP configuration
2. Check email logs
3. Verify email address is valid
4. Check firewall/network settings

## Maintenance Tasks

### Daily Tasks

- Monitor system health
- Check error logs
- Verify backups completed successfully

### Weekly Tasks

- Review audit logs
- Check performance metrics
- Verify data integrity
- Update security patches

### Monthly Tasks

- Review user access
- Audit role assignments
- Test disaster recovery
- Review system capacity

### Quarterly Tasks

- Performance optimization
- Security audit
- Capacity planning
- Update documentation

## Scaling & Performance

### Horizontal Scaling

1. Add additional application servers
2. Configure load balancer
3. Update API endpoint configuration
4. Test failover

### Vertical Scaling

1. Increase server resources (CPU, RAM)
2. Optimize database indexes
3. Increase connection pool size
4. Monitor performance improvements

### Database Optimization

1. Analyze slow queries
2. Create indexes on frequently queried columns
3. Archive old data
4. Optimize table structure

## Support & Resources

### Getting Help

- Check system logs: **Admin** → **Monitoring** → **Error Logs**
- Review audit logs: **Admin** → **Audit Logs**
- Contact technical support
- Check documentation

### Documentation

- Technical Documentation: See TECHNICAL_DOCUMENTATION.md
- User Guide: See USER_GUIDE.md
- API Documentation: Available in Admin panel

### Emergency Contacts

- System Administrator: [contact info]
- Database Administrator: [contact info]
- Security Team: [contact info]
- Support Team: support@company.com
