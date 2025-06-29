# Code Generation Guidelines

## API Schema

- Location  : Didalam root project `./api-schema.yaml`
- File ini berisi API contract yang digunakan sebagai dokumentasi dan rujukan ketika membangun API.
- Selalu update file ini ketika ada perubahan permintaan saat membuat modul baru atau jika dokumentasi belum ada tambahkan. 

## Database Schema

- Location  : Didalam root project `./schema.yaml`
- File ini berisi skema database yang akan digunakan untuk membuat database.
- Selalu update file ini ketika ada perubahan permintaan saat membuat modul baru atau jika dokumentasi belum ada tambahkan. 

## API Code Generation

Ketentuan saat user meminta untuk membuat api:
- Perhatikan api kontrak dan jadikan sebagai rujukan `./api-schema.yaml`
- Apabila belum ada api kontraknya buat terlebih dahulu
- Buatkan atau edit file rest client (location: `rest/api.rest`), sesuaikan dengan api yang baru saja dibuat atau diedit. File harus sesuai dengan standar penulisan ekstensi `Rest Client`.

## Frontend Integration

Ketentuan saat user meminta untuk mengintegrasikan api dengan aplikasi web:
- Jika user tidak meminta untuk mengintegrasikan api, maka jangan integrasikan.
