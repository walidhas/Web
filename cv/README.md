# CV — Yassine Zakhama (version améliorée)

## Fichiers

- `CV_Yassine_Zakhama_FR.html` — template source (éditable, impression A4)
- `CV_Yassine_Zakhama_FR.pdf` — export PDF prêt à envoyer

## Améliorations par rapport à la version d’origine

### Contenu
- Profil resserré (3 lignes), orienté impact + rôle de référent technique
- Métriques clarifiées (latence, efficacité opérationnelle, incidents)
- Stages condensés (1 puce chacun) pour mettre en avant Integration Objects
- Compétences allégées (moins de stack secondaire / redondante)
- Certifications non alignées (.NET) retirées
- Ajout d’un signal « remote / hybride »

### Template
- Mise en page A4 single-column, ATS-friendly
- Typographie Fraunces + Source Sans 3
- Accent teal professionnel, hiérarchie claire
- En-tête compact (identité + contacts)
- Sections scannables en une page

## Régénérer le PDF

```bash
google-chrome --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=cv/CV_Yassine_Zakhama_FR.pdf \
  --print-to-pdf-no-header \
  file://$PWD/cv/CV_Yassine_Zakhama_FR.html
```
