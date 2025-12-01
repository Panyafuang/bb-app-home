# BB Gold - GitLab CI/CD Deployment Setup

## ✅ Completed Steps

### 1. SSH Key Created
- **Private Key**: `deploy-ci-key` (do NOT commit to git)
- **Public Key**: `deploy-ci-key.pub`
- Key has been copied to `170.60.215.99` and tested successfully

### 2. Environment Configuration
- `.env` file updated with port 8085 for frontend
- Database and other services configured

---

## 🔧 GitLab Configuration Required

### Step 1: Add SSH Private Key to GitLab CI/CD Variables

1. Go to your GitLab project
2. Navigate to: **Settings → CI/CD → Variables**
3. Click **"Add variable"**
4. Configure the variable:
   - **Key**: `SSH_PRIVATE_KEY`
   - **Value**: Paste the entire content of `deploy-ci-key` file
   - **Type**: **File** (recommended for SSH keys - creates a temporary file)
   - **Environment scope**: `*` (all)
   - **Protect variable**: ✓ (checked)
   - **Mask variable**: ✗ (unchecked - SSH keys contain characters that cannot be masked)
   - **Expand variable reference**: ✗ (unchecked)

**Note**: Using **File** type is better than **Variable** type for SSH keys because:
- GitLab stores it as a temporary file with proper permissions (600)
- Avoids issues with newlines and special characters
- The variable value becomes a file path that you can use directly with `-i`

### Step 2: Configure Other CI/CD Variables

Go to: **Settings → CI/CD → Variables** and add these variables:

| Variable Name | Value | Protected | Masked |
|--------------|-------|-----------|--------|
| `SSH_PRIVATE_KEY` | *content of deploy-ci-key* | ✓ | ✗ |
| `DEV_SERVER` | `170.60.215.99` | ✓ | ✗ |
| `PROD_SERVER` | `170.60.215.99` | ✓ | ✗ |
| `SERVER_USER` | `bb-admin` | ✓ | ✗ |
| `DEPLOY_DIR` | `/home/bb-admin/bb-gold` | ✓ | ✗ |
| `POSTGRES_DB` | `bb_gold` | ✓ | ✗ |
| `POSTGRES_USER` | `bb_user` | ✓ | ✗ |
| `POSTGRES_PASSWORD` | `bb_secure_2024` | ✓ | ✗ |
| `BACKEND_PORT` | `4000` | ✗ | ✗ |
| `FRONTEND_PORT` | `8085` | ✗ | ✗ |
| `ADMINER_PORT` | `8080` | ✗ | ✗ |
| `GRAFANA_PORT` | `3000` | ✗ | ✗ |
| `GRAFANA_ADMIN_USER` | `admin` | ✓ | ✗ |
| `GRAFANA_ADMIN_PASSWORD` | `bb_gold_grafana_2024` | ✓ | ✗ |
| `TZ` | `Asia/Bangkok` | ✗ | ✗ |

**Important Notes:**
- Set **Environment scope** to `*` (all environments)
- Check **Protected** for sensitive variables (they'll only work on protected branches)
- **Masked** cannot be used for these passwords due to underscores/special characters - they will still be protected variables

### Step 3: Protect the Branch (if using protected variables)

1. Go to: **Settings → Repository → Protected branches**
2. Add `develop` branch as protected (if not already)
3. Allow maintainers to push and merge

---

## 🚀 Deployment Workflow

### For Development (develop branch):
```bash
git add .
git commit -m "Your changes"
git push origin develop
```
- Automatically builds and deploys to `170.60.215.99`
- Frontend available at: `http://170.60.215.99:8085`

### For Production (tagged release):
```bash
git tag v1.0.0
git push origin v1.0.0
```
- Builds and deploys to production server
- Creates a GitLab release

---

## 📦 Services After Deployment

Once deployed to `170.60.215.99`, access services at:

- **Frontend**: http://170.60.215.99:8085
- **Backend API**: http://170.60.215.99:4000
- **Adminer (DB UI)**: http://170.60.215.99:8080
- **Grafana**: http://170.60.215.99:3000

---

## 🔐 Security Notes

1. **Never commit these files**:
   - `deploy-ci-key` (private key)
   - `.env` (contains passwords)
   
2. These are already in `.gitignore`:
   ```
   deploy-ci-key
   deploy-ci-key.pub
   .env
   ```

3. The private key (`deploy-ci-key`) should only exist:
   - On your local machine (for testing)
   - In GitLab CI/CD Variables as `SSH_PRIVATE_KEY`

---

## 🧪 Test Deployment Manually

To test deployment manually before pushing to GitLab:

```bash
# Test SSH connection
ssh -i deploy-ci-key bb-admin@170.60.215.99

# Deploy manually
rsync -avz --delete \
  -e "ssh -i deploy-ci-key" \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude 'persist' \
  ./ bb-admin@170.60.215.99:/home/bb-admin/bb-gold/

# SSH to server and start services
ssh -i deploy-ci-key bb-admin@170.60.215.99
cd /home/bb-admin/bb-gold
docker compose up -d
```

---

## 📝 First Time Server Setup

On the server `170.60.215.99`, make sure:

```bash
# Install Docker and Docker Compose
sudo apt update
sudo apt install docker.io docker-compose -y

# Add bb-admin to docker group
sudo usermod -aG docker bb-admin
# Log out and back in for group change to take effect

# Create deployment directory
mkdir -p /home/bb-admin/bb-gold
```

---

## 🐛 Troubleshooting

### Pipeline fails with "SSH_PRIVATE_KEY not set"
- Make sure `SSH_PRIVATE_KEY` variable is added to GitLab CI/CD Variables
- The value should be the entire content of the `deploy-ci-key` file
- Variable cannot be masked due to special characters in SSH keys (=, /, +, newlines)
- Make sure it's marked as "Protected" to keep it secure

### SSH connection fails
- Verify the public key is in `~/.ssh/authorized_keys` on the server
- Test manually: `ssh -i deploy-ci-key bb-admin@170.60.215.99`

### Docker build fails
- Check the Dockerfile paths are correct
- Verify pnpm-lock.yaml is in sync (it should be after the fix)

### Services don't start
- SSH to server and check: `docker compose logs`
- Verify .env file was created correctly on server
