# Cloud Platform Brief

A focused weekly briefing for Cloud and Platform Architects, published at **[news.burnzo.de](https://news.burnzo.de)**.

## What it covers

- AWS, Azure and GCP service changes
- Kubernetes and cloud-native ecosystem developments
- Terraform, OpenTofu, Pulumi and infrastructure-as-code practices
- Security, networking, observability, reliability and cost governance
- Platform engineering patterns with architectural consequences
- AI infrastructure, model serving, MLOps, governance and material model-platform changes
- Developer experience, internal developer platforms, CI/CD, portals, golden paths and tools such as Backstage, Harness and Argo

AI and developer-tooling coverage stays architecture-focused. General AI news, consumer features and routine product announcements are excluded.

Every item answers three questions: what changed, why it matters, and whether to **Act now**, **Evaluate**, **Watch**, or **Read deeper**.

## Architecture

The site is dependency-free static HTML, CSS and JavaScript. Briefings live in `data/briefings.json`. GitHub Actions validates the data and deploys the repository to GitHub Pages on every push to `main`.

## Publish locally

```bash
python scripts/validate_data.py
python -m http.server 8080
```

Open `http://localhost:8080`.

## Deployment

The site is deployed automatically to [news.burnzo.de](https://news.burnzo.de) through GitHub Pages. Every push to `main` triggers the deployment workflow in `.github/workflows/pages.yml`.

## Automated editions

The scheduled ChatGPT task owns weekly research and publishing. It prepends a valid edition to `data/briefings.json`, updates `feed.xml`, validates source URLs and commits directly to `main`. The Pages workflow then publishes the update automatically.

The site intentionally contains no API credentials. Repository access remains with the connected GitHub integration, and content generation stays outside the public build.

## Editorial disclaimer

Briefings are generated and curated with AI from the linked primary sources. They may contain errors, omissions or outdated interpretations and do not constitute professional advice. Consequential architecture, security, operational and financial decisions should always be verified against the original sources.
