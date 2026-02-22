# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 0.1.x | ✅ |

## Security Practices

- **Authentication:** JWT-based sessions with bcrypt password hashing
- **Secrets Management:** Environment variables for all sensitive config (DB credentials, JWT secret). No secrets committed to version control
- **Container Security:** Non-root user in production Docker images, multi-stage builds to minimize attack surface
- **Network Security:** Terraform security groups restrict internal service ports. SSH access is configurable via `admin_cidr` variable
- **Rate Limiting:** API rate limiting (100 req/15 min per IP) to prevent brute-force and abuse
- **CORS:** Configurable origin restriction via environment variables
- **Database:** Encrypted EBS volumes, automated daily backups with 7-day retention

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public GitHub issue
2. Email the maintainer directly with details of the vulnerability
3. Include steps to reproduce the issue
4. Allow reasonable time for a fix before public disclosure

## Known Limitations

- HTTPS/TLS is not configured by default (recommended for production via a load balancer or Certbot)
- Session tokens do not have a refresh mechanism
