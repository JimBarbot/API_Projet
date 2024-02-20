
// import des modules nécessaire
const express = require('express'); // Express va permettre de gérer nos routes et les requêtes HTTP
const path = require('path'); // permet de travailler les chemins de nos fichiers 
const fs = require('fs'); // il va me permettre de créer et écrire un fichier PDF à partir des données du formulaire
const PDFDocument = require('pdfkit'); // pdfkit est ce que j'ai le mieux compris pour la génération de pdf
const bodyParser = require('body-parser'); // middleware qui va permettre d'analyser les corps des rêquetes http
const mysql = require('mysql'); // ce qui va me permettre d'intéragir avec ma BDD mysql


const port = process.env.PORT || 8080; // notre appli sera sur le port 8080
const app = express();

// Pour se connecter à la base de donnée node_projet
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'node_projet',
  socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock" // vu que j'utilise le réseau local sur MAMP il faut rajouter le socket et on donne le chemin de notre socket à la BDD 
});

// Pour voir dans le terminal si notre connexion est bien établi = vérification
connection.connect((err) => {
  if(err){
    console.error('Erreur de connexion : '+err.stack)
    return;
  }
  console.log('Connexion à la bdd')
});

// middleware pour analyser les corps de requête JSON
app.use(express.json());

// Il va nous permettre d'analyser les données de formulaire html
app.use(bodyParser.urlencoded({ extended: true }));

// concerne les fichiers statiques depuis le dossier public
app.use(express.static('public')); 

// Première route qui va nous permettre d'afficher le formulaire html 
app.get('/form', (req, res) => {
    // envoie du fichier
    res.sendFile(path.join(__dirname, 'public/index.html')); 
});


// Nouvelle route pour cette fois-ci, générer le PDF à partir des données du formulaire + insertion BDD
app.post('/pdf-formulaire', (req, res) => {
    const { document, prenom, nom, adresse, pays, commune, code, produit, prix, quantité, tva  } = req.body;
  
    const doc = new PDFDocument();
    // texte du document pdf 
    doc.fontSize(16).text('Formulaire', { align: 'center' });
    doc.fontSize(12).text(`Document: ${document}`, 100, 100);
    doc.fontSize(12).text(`Prénom: ${prenom}`, 100, 120);
    doc.fontSize(12).text(`Nom: ${nom}`, 100, 140);
    doc.fontSize(12).text(`Adresse: ${adresse}`, 100, 160);
    doc.fontSize(12).text(`Pays: ${pays}`, 100, 180);
    doc.fontSize(12).text(`Commune: ${commune}`, 100, 200);
    doc.fontSize(12).text(`Code Postal: ${code}`, 100, 220);
    doc.fontSize(12).text(`Produit: ${produit}`, 100, 240);
    doc.fontSize(12).text(`Prix: ${prix}`, 100, 260);
    doc.fontSize(12).text(`Quantité: ${quantité}`, 100, 280);
    doc.fontSize(12).text(`Tva: ${tva}`, 100, 300);

    // c'est le chemin du fichier générer
    const pdfPath = __dirname + '/Formulaire.pdf';

    // La doc indique que cela va nous permettre de créer un flux d'écriture vers notre fichier PDF
    const stream = fs.createWriteStream(pdfPath);

    //On redirige le contenu de notre PDF vers le flux d'écriture vu ci-dessus.
    doc.pipe(stream);
    doc.end();

    // Bloc qui nous permet d'insérer à notre BDD les données que nous avons rentrée dans notre formulaire
    const query = 'INSERT INTO facture (prenom, nom, adresse, pays, commune, codePostal, produit, prix, quantité, tva) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, [prenom, nom, adresse, pays, commune, code, produit, prix, quantité, tva], (err, result) => {
      if(err) throw err; 
      console.log('Données insérées avec succès dans la base de données');
    });
  });
  


app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});

