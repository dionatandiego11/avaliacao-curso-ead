<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1zg9k_CqGWdbLhbQpxGEQtFPriEwpMhh0

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Firebase/Firestore Setup

- Create a Firebase project and enable Authentication (Email/Password and Google) and Firestore.
- Update `firebase.ts` with your Firebase config (already pointing to `avalia-ead`).
- Firestore collections expected by the app:
  - `usuarios`: perfis dos usuários. Criado automaticamente no login/cadastro.
  - Cursos: por padrão configurado como `meu_colecao`.
    - Configure o nome da coleção de cursos em `utils/constants.ts` export `COURSES_COLLECTION`.
    - Campos esperados em cada documento de curso:
      - `CO_CURSO`, `NO_CURSO`, `TP_GRAU_ACADEMICO`, `NO_CINE_ROTULO`, `NO_CINE_AREA_GERAL`, `NO_CINE_AREA_ESPECIFICA`, `NO_CINE_AREA_DETALHADA`,
        `CO_IES`, `NO_IES`, `SG_IES`, `NO_MUNICIPIO_IES`, `SG_UF_IES`, `IN_GRATUITO`
      - Campos agregados (opcionais, o app atualiza ao receber avaliações): `media_geral` (number), `qtd_avaliacoes` (number)
    - Cada curso pode ter a subcoleção `avaliacoes` com documentos contendo os critérios, comentário e metadata.

Se sua coleção de cursos tiver outro nome, basta ajustar `utils/constants.ts`.
