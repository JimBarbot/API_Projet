const form = document.getElementById('myForm'); // on selectionne notre formulaire à l'aide de son ID

form.addEventListener('submit', (event) => {
  // permet d'empêcher le comportement par défault du form de recharger la page une fois soumis
  event.preventDefault();

  const formData = new FormData(form); // représente les données du formulaire


  // On utilise Fetch qui envoie une requête POST à l'URM '/formPost' avec les data de notre form
  fetch('/formPost', {
    method: 'POST',
    body: formData
  })

  // Pour gérer la réponse de la requête
  .then(response => response.json())
  .then(data => {
    console.log(data); // Afficher les données renvoyées par le serveur
  })
  .catch(error => {
    console.error('Error:', error);
  });
});