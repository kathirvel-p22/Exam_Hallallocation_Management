# Local Development Server

A complete local development server setup for the Exam Seat Allocation Management System that allows you to run the application without external web server configuration.

## Features

- **Zero-Configuration Setup**: Start the system with a single command
- **Automatic Database Setup**: Creates and configures the database automatically
- **Demo Mode**: Interactive demo with sample data to explore system functionality
- **Health Check**: Verifies all components are working correctly
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Easy CLI**: Simple command-line interface for server management

## Quick Start

### Windows Users

```bash
# Double-click windows_launcher.bat
# Or run from command line:
server\windows_launcher.bat
```

### macOS/Linux Users

```bash
# Make the launcher executable and run:
chmod +x server/launcher.sh
./server/launcher.sh
```

## Usage

### Start the Server

```bash
php server/start_server.php
```

### Start with Demo Mode

```bash
php server/start_server.php --demo
```

### Run Health Check

```bash
php server/health_check.php
```

### CLI Management

```bash
php server/cli_manager.php [command]
```

Available commands:

- `start` - Start the development server
- `stop` - Stop the development server
- `demo` - Start demo mode
- `health` - Run health check
- `setup` - Run database setup
- `status` - Show server status

## Server Configuration

The server automatically:

- Starts on port 8000 (configurable)
- Sets up the database if needed
- Creates sample data for demo mode
- Provides health monitoring

## Demo Mode

Demo mode includes:

- Sample students and classes
- Pre-configured exam schedules
- Sample room layouts
- Example allocations
- Interactive tour of features

## Health Check

The health check verifies:

- PHP version compatibility
- Required extensions
- Database connectivity
- File permissions
- Configuration files
- Security settings

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 8000
netstat -an | grep 8000

# Kill the process or use a different port
php server/start_server.php --port 8001
```

### Database Issues

```bash
# Run setup manually
php server/cli_manager.php setup

# Check database connection
php server/health_check.php
```

### Permission Issues (Linux/macOS)

```bash
# Make scripts executable
chmod +x server/*.php
chmod +x server/*.sh
```

## Development

### Custom Port

```bash
php server/start_server.php --port 9000
```

### Custom Host

```bash
php server/start_server.php --host 0.0.0.0
```

### Verbose Output

```bash
php server/start_server.php --verbose
```

## Security Notes

- The development server is for local development only
- Do not use in production environments
- Database credentials are stored in plain text for development
- Always run health checks before starting development

## Support

For issues or questions:

1. Run the health check first
2. Check the troubleshooting section
3. Review the system requirements
4. Check the main project documentation
