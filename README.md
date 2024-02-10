# SureForm
SureForm est une bibliothèque légère et flexible pour améliorer l'expérience utilisateur et la validation des formulaires dans les applications web. En utilisant SureForm, vous pouvez facilement ajouter une validation côté client robuste, personnaliser les messages d'erreur, et améliorer l'accessibilité de vos formulaires.

## Installation
Pour intégrer SureForm dans votre projet, suivez ces étapes :

### Via NPM
```npm
npm install sureform --save
```

### Directement dans votre HTML
```html
<script src="path/to/sureform.js"></script>
```

## Utilisation
Pour utiliser SureForm, créez une instance de `SureForm` en passant l'élément de formulaire et les champs à valider.

```javascript
const form = document.querySelector('#myForm');
const fields = ['username', 'email', 'password'];

const sureForm = new SureForm(form, fields, {
    // Options de configuration (facultatif)
});
```

### Ajouter des validations personnalisées
Vous pouvez étendre SureForm avec vos propres fonctions de validation.

```javascript
sureForm.addCustomValidation('username', (value) => {
    if (value === 'test') {
        return 'Ce nom d’utilisateur ne peut pas être utilisé.';
    }
});
```

### Écouter les événements de validation
```javascript
form.addEventListener('beforeValidate', () => console.log('Validation commencée'));
form.addEventListener('afterValidate', () => console.log('Validation réussie'));
form.addEventListener('onError', (e) => console.log('Erreurs de validation détectées', e.detail.errors));
```

## API

### `new SureForm(form, fields, options)`
Crée une nouvelle instance de SureForm.
- `form`: L'élément de formulaire HTML.
- `fields`: Un tableau de noms de champs à valider.
- `options`: Un objet d'options pour personnaliser la validation et l'affichage des erreurs.

### `addCustomValidation(fieldName, validationFunction)`
Ajoute une validation personnalisée pour un champ spécifique.
- `fieldName`: Le nom du champ à valider.
- `validationFunction`: Une fonction qui retourne un message d'erreur si la validation échoue, sinon rien.

## Démonstrations Interactives
Visitez les liens suivants pour voir SureForm en action :
- [Validation Basique](#) - Démontre la validation des champs obligatoires, e-mails, et mots de passe.
- [Validation Avancée](#) - Montre des validations personnalisées et asynchrones.
- [Personnalisation](#) - Exemple de personnalisation des messages d'erreur et des thèmes.
- [Événements](#) - Utilisation des événements personnalisés de SureForm.
