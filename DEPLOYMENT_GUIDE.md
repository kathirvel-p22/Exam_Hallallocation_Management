# 🚀 AcadeX Production Deployment Guide

## 🎯 **Overview**

This guide covers deploying the AcadeX platform to production environments with best practices for security, performance, and scalability.

---

## 🏗️ **Architecture Options**

### **Option 1: Single Server Deployment (Recommended for Small-Medium Scale)**
- **Server**: Single VPS/EC2 instance
- **Database**: SQLite or PostgreSQL
- **Reverse Proxy**: Nginx
- **SSL**: Let's Encrypt
- **Monitoring**: PM2 + basic monitoring

### **Option 2: Containerized Deployment (Docker)**
- **Containers**: Docker + Docker Compose
- **Orchestration**: Docker Swarm or Kubernetes
- **Database**: PostgreSQL container or managed service
- **Load Balancer**: Nginx or cloud load balancer

### **Option 3: Cloud-Native Deployment**
- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: AWS Lambda, Google Cloud Run, or Azure Functions
- **Database**: AWS RDS, Google Cloud SQL, or Azure Database
- **Storage**: AWS S3, Google Cloud Storage

---

## 🔧 **Pre-Deployment Setup**

### **1. Environment Configuration**

Create production environment file:
```bash
# .env.production
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/acadex_prod"

# JWT Secrets (Generate strong secrets!)
JWT_SECRET="your-super-secure-jwt-secret-here"
JWT_REFRESH_SECRET="your-super-secure-refresh-secret-here"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Redis (for caching and sessions)
REDIS_URL="redis://localhost:6379"

# Email Service
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# File Upload
UPLOAD_MAX_SIZE="10MB"
UPLOAD_ALLOWED_TYPES="image/jpeg,image/png,application/pdf"

# Security
CORS_ORIGIN="https://yourdomain.com"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
SENTRY_DSN="your-sentry-dsn"
LOG_LEVEL="info"
```

### **2. Database Migration**

For PostgreSQL production:
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE acadex_prod;
CREATE USER acadex_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE acadex_prod TO acadex_user;
\q

# Update schema for PostgreSQL
npx prisma db push --schema=./prisma/schema.prisma
npx prisma db seed
```

---

## 🐳 **Docker Deployment**

### **1. Create Dockerfile**
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

# Build backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Copy backend
COPY --from=builder /app/backend ./
# Copy built frontend
COPY --from=builder /app/frontend/dist ./public

# Install PM2 globally
RUN npm install -g pm2

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S acadex -u 1001
USER acadex

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/system/health || exit 1

CMD ["pm2-runtime", "start", "src/server.js", "--name", "acadex"]
```

### **2. Docker Compose Setup**
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://acadex_user:secure_password@db:5432/acadex_prod
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=acadex_prod
      - POSTGRES_USER=acadex_user
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### **3. Nginx Configuration**
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream acadex_backend {
        server app:5000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;

        # Security Headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

        # Gzip Compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

        # API Routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://acadex_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Login Rate Limiting
        location /api/auth/login {
            limit_req zone=login burst=3 nodelay;
            proxy_pass http://acadex_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Socket.io
        location /socket.io/ {
            proxy_pass http://acadex_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static Files
        location / {
            proxy_pass http://acadex_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }
    }
}
```

---

## ☁️ **Cloud Deployment**

### **AWS Deployment**

#### **1. EC2 Setup**
```bash
# Launch EC2 instance (Ubuntu 22.04 LTS)
# Security Group: Allow HTTP (80), HTTPS (443), SSH (22)

# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.15.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### **2. RDS Database Setup**
```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
    --db-instance-identifier acadex-prod \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username acadex_admin \
    --master-user-password SecurePassword123 \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-xxxxxxxxx \
    --backup-retention-period 7 \
    --multi-az
```

#### **3. S3 for File Storage**
```javascript
// Update backend to use S3
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// File upload to S3
const uploadToS3 = async (file, key) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  };
  return s3.upload(params).promise();
};
```

### **Google Cloud Deployment**

#### **1. Cloud Run Setup**
```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/acadex

# Deploy to Cloud Run
gcloud run deploy acadex \
    --image gcr.io/PROJECT_ID/acadex \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars NODE_ENV=production
```

#### **2. Cloud SQL Setup**
```bash
# Create Cloud SQL instance
gcloud sql instances create acadex-db \
    --database-version=POSTGRES_14 \
    --tier=db-f1-micro \
    --region=us-central1

# Create database
gcloud sql databases create acadex_prod --instance=acadex-db
```

---

## 🔒 **Security Hardening**

### **1. Server Security**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# Install fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### **2. Application Security**
```javascript
// Add security middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);
```

### **3. SSL Certificate (Let's Encrypt)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 **Monitoring & Logging**

### **1. Application Monitoring**
```javascript
// Add Sentry for error tracking
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

// Add Winston for logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

### **2. System Monitoring**
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Setup log rotation
sudo nano /etc/logrotate.d/acadex
```

```
/app/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nodejs nodejs
}
```

---

## 🔄 **Backup Strategy**

### **1. Database Backup**
```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="acadex_prod"

# Create backup
pg_dump $DB_NAME > $BACKUP_DIR/acadex_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/acadex_backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "acadex_backup_*.sql.gz" -mtime +30 -delete

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/acadex_backup_$DATE.sql.gz s3://your-backup-bucket/
```

### **2. File Backup**
```bash
#!/bin/bash
# backup-files.sh

DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backups/files_backup_$DATE.tar.gz /app/uploads
aws s3 cp /backups/files_backup_$DATE.tar.gz s3://your-backup-bucket/files/
```

### **3. Automated Backups**
```bash
# Add to crontab
crontab -e

# Daily database backup at 2 AM
0 2 * * * /path/to/backup-db.sh

# Weekly file backup on Sundays at 3 AM
0 3 * * 0 /path/to/backup-files.sh
```

---

## 🚀 **Deployment Script**

### **Complete Deployment Script**
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting AcadeX deployment..."

# Pull latest code
git pull origin main

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm ci
npm run build
cd ..

# Update backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm ci
cd ..

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma db push

# Restart services
echo "🔄 Restarting services..."
docker-compose down
docker-compose up -d --build

# Health check
echo "🏥 Performing health check..."
sleep 10
curl -f http://localhost:5000/api/system/health || exit 1

echo "✅ Deployment completed successfully!"
```

---

## 📋 **Production Checklist**

### **Pre-Deployment**
- [ ] Environment variables configured
- [ ] Database migrated and seeded
- [ ] SSL certificates installed
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Load testing completed

### **Post-Deployment**
- [ ] Health checks passing
- [ ] All endpoints responding
- [ ] Authentication working
- [ ] File uploads working
- [ ] Email notifications working
- [ ] Real-time features working
- [ ] Performance monitoring active
- [ ] Error tracking active

### **Ongoing Maintenance**
- [ ] Regular security updates
- [ ] Database maintenance
- [ ] Log rotation
- [ ] Backup verification
- [ ] Performance monitoring
- [ ] User feedback collection

---

## 🆘 **Troubleshooting**

### **Common Issues**

#### **Database Connection Issues**
```bash
# Check database status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U acadex_user -d acadex_prod

# Check logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

#### **Application Not Starting**
```bash
# Check application logs
docker-compose logs app

# Check PM2 status
pm2 status
pm2 logs acadex

# Check system resources
htop
df -h
```

#### **SSL Certificate Issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run

# Check Nginx configuration
sudo nginx -t
```

---

## 📞 **Support**

For deployment support:
- **Documentation**: Check API_DOCUMENTATION.md
- **Issues**: Create GitHub issue
- **Community**: Join Discord/Slack channel
- **Professional Support**: Contact development team

---

*Deployment Guide | Version 2.0.0 | Last Updated: March 10, 2026*