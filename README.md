# HTTP Cat Migrator

This project migrates the front page of the HTTPS Status Cats website (https://http.cat) to W3UP, ensuring that all cat images and CSS are preserved.

## Setup

1. **Clone the repository**
    ```bash
    git clone https://github.com/hakierka/http-cat-migrator.git
    cd http-cat-migrator
    ```

2. **Install dependencies**
    ```bash
    npm install
    ```

3. **Run the migration script**
    ```bash
    node migrateHttpCats.mjs
    ```

4. **Confirm login**
    - Check your email, confirm the login.

5. **Access the migrated page**
    - The URL will be displayed in the terminal after successful upload.
    Like: https://bafybeifaoo2ggb66aeintyrockvrkzix7hmqiqsofqubrumrdpvln7dj2m.ipfs.dweb.link/

## Script Overview

The script performs the following steps:
1. Downloads the front page HTML of https://http.cat.
2. Scans the HTML for cat images and CSS files.
3. Downloads these assets locally.
4. Uploads all contents to W3UP.
5. Updates the HTML to reference the uploaded assets correctly.
6. Outputs the URL to access the migrated cat page on W3UP.

## License

