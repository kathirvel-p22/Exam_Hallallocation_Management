#!/bin/bash

# Exam Hall Allocation Management System - Deployment Script
# This script helps deploy the application to various hosting platforms

set -e

echo "🚀 Exam Hall Allocation Management System Deployment"
echo "=================================================="

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    if ! command -v git &> /dev/null; then
        echo "❌ Git is not installed. Please install Git first."
        exit 1
    fi
    
    if ! command -v php &> /dev/null; then
        echo "❌ PHP is not installed. Please install PHP first."
        exit 1
    fi
    
    echo "✅ Requirements check complete"
}

# Validate environment configuration
validate_env() {
    echo "🔍 Validating environment configuration..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            echo "⚠️  .env file not found. Please copy .env.example to .env and configure your settings."
            echo "   cp .env.example .env"
            echo "   # Then edit .env with your database and other settings"
        else
            echo "⚠️  No .env.example file found. Please create a .env file with your configuration."
        fi
    else
        echo "✅ Environment configuration found"
    fi
}

# Check database connection
test_database() {
    echo "🗄️  Testing database connection..."
    
    if [ -f "config/database.php" ]; then
        php -r "
        require_once 'config/database.php';
        \$db = new Database();
        \$conn = \$db->getConnection();
        if (\$conn) {
            echo '✅ Database connection successful\n';
            \$db->closeConnection();
        } else {
            echo '❌ Database connection failed\n';
            exit(1);
        }
        "
    else
        echo "⚠️  Database configuration file not found"
    fi
}

# Validate PHP syntax
validate_php() {
    echo "🔍 Validating PHP syntax..."
    
    find . -name "*.php" -not -path "./.git/*" | while read file; do
        if ! php -l "$file" > /dev/null 2>&1; then
            echo "❌ Syntax error in $file"
            php -l "$file"
            exit 1
        fi
    done
    
    echo "✅ PHP syntax validation complete"
}

# Create deployment summary
create_summary() {
    echo "📊 Creating deployment summary..."
    
    cat > DEPLOYMENT_SUMMARY.md << EOF
# Deployment Summary

## Environment Information
- Deployment Date: $(date)
- PHP Version: $(php -v | head -n1)
- Git Status: $(git status --porcelain | wc -l) modified files

## Configuration Status
- Environment File: $([ -f ".env" ] && echo "✅ Configured" || echo "❌ Not found")
- Database Config: $([ -f "config/database.php" ] && echo "✅ Present" || echo "❌ Missing")
- Web Server Config: $([ -f "vercel.json" ] && echo "✅ Vercel ready" || echo "❌ Vercel config missing")

## Files for Deployment
- Main Application: public/
- Configuration: config/
- Assets: css/, js/, assets/
- Documentation: docs/

## Next Steps
1. Configure your .env file with production settings
2. Set up your database and import database_schema.sql
3. Configure your web server (Apache/Nginx) or use platform configs
4. Test the application locally before deploying
5. Deploy to your chosen platform

## Platform-Specific Instructions
- Vercel: Use vercel.json configuration
- Netlify: Use netlify.toml configuration
- Traditional Hosting: Use standard PHP/MySQL setup

EOF
    
    echo "✅ Deployment summary created: DEPLOYMENT_SUMMARY.md"
}

# Main deployment function
deploy() {
    echo "🚀 Starting deployment process..."
    
    check_requirements
    validate_env
    test_database
    validate_php
    create_summary
    
    echo ""
    echo "🎉 Deployment preparation complete!"
    echo ""
    echo "📋 Summary:"
    echo "   - Requirements checked"
    echo "   - Environment validated"
    echo "   - Database tested"
    echo "   - PHP syntax validated"
    echo "   - Deployment summary created"
    echo ""
    echo "💡 Next steps:"
    echo "   1. Review DEPLOYMENT_SUMMARY.md"
    echo "   2. Configure your production environment"
    echo "   3. Deploy to your chosen platform"
    echo ""
}

# Handle command line arguments
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "validate")
        check_requirements
        validate_env
        test_database
        validate_php
        ;;
    "help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy    - Full deployment process (default)"
        echo "  validate  - Only validate requirements and configuration"
        echo "  help      - Show this help message"
        ;;
    *)
        echo "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac