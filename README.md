# Hamzury — Public Front Door

Single static page. No build step, no dependencies, no backend.

## Deploy (GitHub Pages)

    git init && git add . && git commit -m "Hamzury front door"
    git branch -M main
    git remote add origin https://github.com/<you>/<repo>.git
    git push -u origin main

Then: repo Settings -> Pages -> Source: `main` / root.

## Do not publish

`hamzury-system.html` is the internal CRM/Journey prototype.
It is listed in .gitignore and must never be added to this repository.

## Payment details in the page

Moniepoint · Hamzury Mainstream Ltd · 82025158500 · NGN 5,000 application fee.
Evidence is sent by the applicant via WhatsApp. There is no backend and no receipt storage.
