import axios from 'axios';
import cheerio from 'cheerio';
import { create } from '@web3-storage/w3up-client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Function to get the directory name for the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to download files
const downloadFile = async (url, outputPath) => {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

// Main function to migrate HTTPS Status Cats website
const migrateHttpCats = async () => {
  try {
    // Step 1: Download front page HTML
    const { data: html } = await axios.get('https://http.cat');
    const $ = cheerio.load(html);

    // Step 2: Scan for cat images and CSS
    const urlsToDownload = [];
    const cssFiles = [];
    const imageFiles = [];
    $('img').each((_, element) => {
      const imgUrl = $(element).attr('src');
      if (imgUrl) {
        const fullUrl = `https://http.cat${imgUrl}`;
        urlsToDownload.push(fullUrl);
        imageFiles.push(imgUrl);
      }
    });
    $('link[rel="stylesheet"]').each((_, element) => {
      const cssUrl = $(element).attr('href');
      if (cssUrl) {
        const fullUrl = `https://http.cat${cssUrl}`;
        urlsToDownload.push(fullUrl);
        cssFiles.push(cssUrl);
      }
    });

    // Step 3: Download images and CSS
    console.log('Downloading images and CSS files...');
    const downloadPromises = urlsToDownload.map(async (url) => {
      const fileName = path.basename(url);
      const outputPath = path.join(__dirname, fileName);
      await downloadFile(url, outputPath);
      return new File([await fs.promises.readFile(outputPath)], fileName);
    });
    const files = await Promise.all(downloadPromises);
    console.log('Downloaded all files successfully.');

    // Step 4: Upload all contents to W3UP
    const client = await create();
    const myAccount = await client.login('amy.waliszewska@gmail.com');
    console.log('Please check your email and confirm the login.');
    await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for email confirmation

    const space = await client.createSpace('http-cats-migrated');
    await myAccount.provision(space.did());
    await space.save();
    await client.setCurrentSpace(space.did());

    console.log('Uploading files to W3UP...');
    const directoryCid = await client.uploadDirectory(files);
    const baseUrl = `https://${directoryCid}.ipfs.dweb.link/`;
    console.log('Uploaded all files successfully.');

    // Step 5: Update HTML to correctly reference the uploaded CSS and image files
    cssFiles.forEach((cssFile) => {
      $('link[rel="stylesheet"][href="' + cssFile + '"]').attr('href', baseUrl + path.basename(cssFile));
    });
    imageFiles.forEach((imgFile) => {
      $('img[src="' + imgFile + '"]').attr('src', baseUrl + path.basename(imgFile));
    });

    const updatedHtml = $.html();
    const htmlFilePath = path.join(__dirname, 'index.html');
    await fs.promises.writeFile(htmlFilePath, updatedHtml);
    files.push(new File([await fs.promises.readFile(htmlFilePath)], 'index.html'));

    console.log('Uploading updated HTML file...');
    const finalDirectoryCid = await client.uploadDirectory(files);
    const uploadedUrl = `https://${finalDirectoryCid}.ipfs.dweb.link/`;
    console.log(`Access the migrated cat page at: ${uploadedUrl}`);
  } catch (error) {
    console.error('Error during migration:', error);
  }
};

// Execute the migration
migrateHttpCats();
