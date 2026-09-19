# Cloud Platform Brief

A high-signal weekly briefing for Cloud and Platform Architects, published at **[news.burnzo.de](https://news.burnzo.de)**.

## What it covers

- AWS and Azure service changes
- Kubernetes and cloud-native ecosystem developments
- Terraform, OpenTofu and infrastructure-as-code practices
- Security, networking, observability, reliability and cost governance
- Platform engineering patterns with architectural consequences

Every item answers three questions: what changed, why it matters, and whether to **Act now**, **Evaluate**, **Watch**, or **Read deeper**.

## Architecture

The site is dependency-free static HTML, CSS and JavaScript. Briefings live in `data/briefings.json`. GitHub Actions validates the data and deploys the repository to GitHub Pages on every push to `main`.

## Publish locally

```bash
python scripts/validate_data.py
python -m http.server 8080
```

Open `http://localhost:8080`.

## GitHub Pages setup

1. Create a public repository named `cloud-platform-news` under `burnz0`.
2. Push this project to the `main` branch.
3. In **Settings → Pages → Build and deployment**, select **GitHub Actions**.
4. Set the custom domain to `news.burnzo.de`.
5. In DNS, create `CNAME news → burnz0.github.io`.
6. After certificate provisioning completes, enable **Enforce HTTPS**.

Do not create a wildcard DNS record for this setup.

## Automated editions

The scheduled ChatGPT task owns weekly research and publishing. It prepends a valid edition to `data/briefings.json`, updates `feed.xml`, validates source URLs and commits directly to `main`. The Pages workflow then publishes the update automatically.

The site intentionally contains no API credentials. Repository access remains with the connected GitHub integration, and content generation stays outside the public build.
