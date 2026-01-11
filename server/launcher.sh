#!/bin/bash

# Exam Seat Allocation Management System - Unix/Linux Launcher
# 
# This shell script provides an easy way to start the development server on Unix-like systems.
# It automatically detects PHP installation and provides a user-friendly interface.

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print header
print_header() {
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║      Exam Seat Allocation Management System - Launcher       ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo
}

# Function to print section header
print_section() {
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                        $1                            ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check PHP installation
check_php() {
    if ! command_exists php; then
        echo -e "${RED}❌ PHP is not installed or not in PATH${NC}"
        echo
        echo "Please install PHP and make sure it's added to your system PATH."
        echo "You can install PHP using your package manager:"
        echo "  Ubuntu/Debian: sudo apt install php"
        echo "  CentOS/RHEL:   sudo yum install php"
        echo "  macOS:         brew install php"
        echo "  Or download from: https://www.php.net/downloads.php"
        echo
        echo "Press Enter to exit..."
        read
        exit 1
    fi
}

# Function to check project files
check_project() {
    if [ ! -f "config/database.php" ]; then
        echo -e "${RED}❌ Configuration files not found${NC}"
        echo
        echo "Please run this script from the project root directory."
        echo "Current directory: $(pwd)"
        echo
        echo "Press Enter to exit..."
        read
        exit 1
    fi
}

# Function to show main menu
show_menu() {
    print_section "Main Menu"
    echo -e "${YELLOW}[1]${NC} Start Development Server (Port 8000)"
    echo -e "${YELLOW}[2]${NC} Start Demo Mode"
    echo -e "${YELLOW}[3]${NC} Run Health Check"
    echo -e "${YELLOW}[4]${NC} System Setup"
    echo -e "${YELLOW}[5]${NC} Check Server Status"
    echo -e "${YELLOW}[6]${NC} Custom Server Options"
    echo -e "${YELLOW}[7]${NC} Help"
    echo -e "${YELLOW}[0]${NC} Exit"
    echo
    read -p "Please select an option (0-7): " choice
    echo
}

# Function to start server
start_server() {
    echo -e "${GREEN}🚀 Starting Development Server...${NC}"
    echo "──────────────────────────────────────"
    php server/start_server.php
}

# Function to start demo
start_demo() {
    echo -e "${GREEN}🎭 Starting Demo Mode...${NC}"
    echo "──────────────────────────────────────"
    php server/start_server.php --demo
}

# Function to run health check
run_health_check() {
    echo -e "${GREEN}🏥 Running Health Check...${NC}"
    echo "──────────────────────────────────────"
    php server/health_check.php --verbose
    echo
    echo "Press Enter to return to menu..."
    read
}

# Function to run setup
run_setup() {
    echo -e "${GREEN}⚙️  Running System Setup...${NC}"
    echo "──────────────────────────────────────"
    php server/cli_manager.php setup
    echo
    echo "Press Enter to return to menu..."
    read
}

# Function to check status
check_status() {
    echo -e "${GREEN}📊 Checking Server Status...${NC}"
    echo "──────────────────────────────────────"
    php server/cli_manager.php status
    echo
    echo "Press Enter to return to menu..."
    read
}

# Function to show help
show_help() {
    print_section "Help"
    echo "This launcher provides easy access to the Exam Seat Allocation"
    echo "Management System development server."
    echo
    echo "Available Options:"
    echo "  • Start Development Server - Launches the server on port 8000"
    echo "  • Start Demo Mode - Launches server with sample data"
    echo "  • Run Health Check - Verifies system components"
    echo "  • System Setup - Configures database and dependencies"
    echo "  • Check Server Status - Shows current server and database status"
    echo "  • Custom Server Options - Advanced server configuration"
    echo "  • Help - Shows this help message"
    echo
    echo "Requirements:"
    echo "  • PHP 7.4 or higher installed and in PATH"
    echo "  • Project files in the current directory"
    echo
    echo "After starting the server:"
    echo "  • Open your browser to http://localhost:8000"
    echo "  • Use Ctrl+C to stop the server"
    echo "  • Return to this menu by pressing Enter"
    echo
    echo "Press Enter to return to menu..."
    read
}

# Function to custom options
custom_options() {
    print_section "Custom Options"
    
    read -p "Port (default: 8000): " port
    read -p "Host (default: localhost): " host
    read -p "Enable verbose output? (y/n): " verbose
    
    args=""
    if [ ! -z "$port" ]; then
        args="$args --port $port"
    fi
    if [ ! -z "$host" ]; then
        args="$args --host $host"
    fi
    if [ "$verbose" = "y" ] || [ "$verbose" = "Y" ]; then
        args="$args --verbose"
    fi
    
    echo
    echo -e "${GREEN}🚀 Starting Server with Custom Options...${NC}"
    echo "──────────────────────────────────────"
    php server/start_server.php $args
}

# Function to handle exit
handle_exit() {
    echo
    echo -e "${GREEN}👋 Goodbye!${NC}"
    echo
    exit 0
}

# Function to handle server end
handle_server_end() {
    echo
    echo "Server stopped."
    echo
    echo "Press Enter to return to menu..."
    read
}

# Main execution
main() {
    # Clear screen
    clear
    
    # Print header
    print_header
    
    # Check PHP
    check_php
    echo -e "${GREEN}✅ PHP installation found${NC}"
    
    # Change to project directory (parent of server directory)
    cd "$(dirname "$0")/.."
    
    # Check project files
    check_project
    echo -e "${GREEN}📁 Project directory: $(pwd)${NC}"
    echo
    
    # Main loop
    while true; do
        show_menu
        
        case $choice in
            1)
                start_server
                handle_server_end
                ;;
            2)
                start_demo
                handle_server_end
                ;;
            3)
                run_health_check
                ;;
            4)
                run_setup
                ;;
            5)
                check_status
                ;;
            6)
                custom_options
                handle_server_end
                ;;
            7)
                show_help
                ;;
            0)
                handle_exit
                ;;
            *)
                echo -e "${RED}❌ Invalid option. Please try again.${NC}"
                echo
                ;;
        esac
    done
}

# Run main function
main "$@"