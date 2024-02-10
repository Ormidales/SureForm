(function() {
    'use strict';
    var sureform = {
        version: "0.0.1"
    };
    
    // Export the sureform object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we're in
    // the browser, add `sureform` as a global object.
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = sureform;
        }
        exports.sureform = sureform;
    } else {
        this.sureform = sureform;
    }

    /* Outil d'amélioration de l'expérience utilisateur pour les formulaires avec trois fonctionnalités principales :
    * - Sécurité : empêcher la soumission de formulaires invalides
    * - Ergonomie : afficher des messages d'erreur pertinents
    * - Accessibilité : indiquer les erreurs aux utilisateurs
    * 
    * Pour l'utiliser, il suffit de créer une instance de SureForm et de lui passer le formulaire et les champs à valider. */
    class SureForm {
        constructor(form, fields, options = {}) {
            this.form = form;
            this.fields = fields;
            this.options = options;
            this.errors = {};
            // Assure que le conteneur d'erreur est prêt pour ARIA
            this.errorContainer = document.createElement('div');
            this.errorContainer.setAttribute('aria-live', 'assertive');
            this.form.prepend(this.errorContainer);
            this.defaultOptions = {
                errorClasses: 'border-red-500', // Classe Tailwind par défaut pour les champs en erreur
                errorMessageClasses: 'text-red-500 mt-2 text-sm', // Classe Tailwind par défaut pour les messages d'erreur
                customMessages: {}, // Messages d'erreur personnalisés par champ
                ...options // Écrase/combine les options par défaut avec celles fournies
            };
            this.init();
        }

        init() {
            this.form.addEventListener('submit', async (e) => {
                e.preventDefault(); // Empêche la soumission du formulaire le temps de la validation
                const isValid = this.validate(); // Validation synchrone
                const isValidAsync = await this.validateAsync(); // Validation asynchrone
                if (isValid && isValidAsync) {
                    this.form.submit(); // Soumet le formulaire si tout est valide
                } else {
                    this.displayErrors();
                }
            });
        }

        emitEvent(eventName, detail = {}) {
            const event = new CustomEvent(eventName, { detail, bubbles: true, cancelable: true });
            this.form.dispatchEvent(event);
        }

        addCustomValidation(fieldName, validationFunction) {
            if (!this.customValidations) {
                this.customValidations = {};
            }
            this.customValidations[fieldName] = validationFunction;
        }

        validate() {
            this.emitEvent('beforeValidate'); // Avant de commencer la validation
            
            this.errors = {};
            this.fields.forEach((field) => {
                const el = this.form.querySelector(`[name="${field}"]`);
                const rules = el.dataset.validation.split('|');
                rules.forEach((rule) => {
                    let errorMessage = '';
                    if (rule.includes('required') && el.value === '') {
                        errorMessage = 'Ce champ est obligatoire.';
                    }
                    if (rule.includes('minlength')) {
                        const matchResult = rule.match(/minlength:(\d+)/);
                        if (matchResult && matchResult[1]) {
                            const length = matchResult[1];
                            if (el.value.length < parseInt(length, 10)) {
                                errorMessage = `La longueur minimale est de ${length} caractères.`;
                            }
                        }
                    }
                    if (rule.includes('maxlength')) {
                        const length = rule.match(/maxlength:(\d+)/)[1];
                        if (el.value.length > parseInt(length, 10)) {
                            errorMessage = `La longueur maximale est de ${length} caractères.`;
                        }
                    }
                    if (rule === 'email') {
                        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
                        if (!emailRegex.test(el.value)) {
                            errorMessage = 'Entrez une adresse e-mail valide.';
                        }
                    }
                    if (rule === 'url') {
                        const urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
                        if (!urlRegex.test(el.value)) {
                            errorMessage = 'Entrez une URL valide.';
                        }
                    }
                    if (rule === 'numeric') {
                        if (!/^[0-9]+$/.test(el.value)) {
                            errorMessage = 'Entrez uniquement des chiffres.';
                        }
                    }
                    if (rule === 'phone') {
                        const phoneRegex = /^\+?[0-9]{10,15}$/; // Exemple basique
                        if (!phoneRegex.test(el.value)) {
                            errorMessage = 'Entrez un numéro de téléphone valide.';
                        }
                    }
                    if (rule.startsWith('postalcode')) {
                        const countryCode = rule.split(':')[1]; // par exemple 'postalcode:FR'
                        let postalCodeRegex;
                        switch (countryCode) {
                            case 'FR':
                                postalCodeRegex = /^\d{5}$/;
                                break;
                            case 'US':
                                postalCodeRegex = /^\d{5}(-\d{4})?$/;
                                break;
                            case 'CA':
                                postalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
                                break;
                            case 'UK':
                                postalCodeRegex = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/;
                                break;
                            case 'DE':
                                postalCodeRegex = /^\d{5}$/;
                                break;
                            case 'AU':
                                postalCodeRegex = /^\d{4}$/;
                                break;
                            // Ajoute d'autres pays si nécessaire
                            default:
                                postalCodeRegex = /^\d+$/; // Fallback simple
                        }
                        if (!postalCodeRegex.test(el.value)) {
                            errorMessage = 'Entrez un code postal valide.';
                        }
                    }
                    if (rule === 'password_strength') {
                        // Exemple simple basé sur la longueur, ajoute ta propre logique
                        if (el.value.length < 8) {
                            errorMessage = 'Le mot de passe doit contenir au moins 8 caractères.';
                        }
                        // Tu peux étendre cette logique pour inclure des vérifications de complexité
                    }
                    if (this.customValidations && this.customValidations[field]) {
                        const el = this.form.querySelector(`[name="${field}"]`);
                        const customError = this.customValidations[field](el.value);
                        if (customError) {
                            this.errors[field] = customError;
                        }
                    }
                    if (errorMessage !== '') {
                        this.errors[field] = errorMessage;
                    }
                });
            });
            if (Object.keys(this.errors).length === 0) {
                this.emitEvent('afterValidate'); // Après une validation réussie
                return true;
            } else {
                this.emitEvent('onError', { errors: this.errors }); // En cas d'erreur
                return false;
            }
        }

        displayErrors() {
            let firstErrorField = null;
        
            this.fields.forEach((field) => {
                const el = this.form.querySelector(`[name="${field}"]`);
                const error = this.errors[field];
                if (error) {
                    // Applique les classes Tailwind aux champs en erreur
                    el.classList.add(...this.defaultOptions.errorClasses.split(' '));
                    const errorEl = document.createElement('div');
                    errorEl.className = this.defaultOptions.errorMessageClasses; // Utilise les classes Tailwind pour les messages d'erreur
                    // Affiche un message d'erreur personnalisé s'il est défini, sinon utilise le message d'erreur par défaut
                    errorEl.innerHTML = this.defaultOptions.customMessages[field] ? this.defaultOptions.customMessages[field] : error;
                    el.parentNode.insertBefore(errorEl, el.nextSibling);
        
                    if (!firstErrorField) {
                        firstErrorField = el;
                    }
                }
            });
        
            if (firstErrorField) {
                firstErrorField.focus();
            }
        }

        removeErrorForField(fieldElement) {
            fieldElement.classList.remove('error');
            const errorEl = fieldElement.parentNode.querySelector('.error-message');
            if (errorEl) {
                errorEl.remove();
            }
        }
    
        removeErrors() {
            this.fields.forEach((field) => {
                const el = this.form.querySelector(`[name="${field}"]`);
                this.removeErrorForField(el);
            });
            // Nettoie également le conteneur d'erreur ARIA-live
            this.errorContainer.innerHTML = '';
        }

        reset() {
            this.removeErrors();
            this.errors = {};
        }

        destroy() {
            this.form.removeEventListener('submit', (e) => this.handleSubmit(e));
        }

        async validateAsync() {
            const validations = this.fields.map(async (field) => {
                const el = this.form.querySelector(`[name="${field}"]`);
                const rules = el.dataset.validation.split('|');
                for (let rule of rules) {
                    if (rule === 'username_available') {
                        await this.checkUsernameAvailability(el.value).then(isAvailable => {
                            if (!isAvailable) {
                                this.errors[field] = 'Ce nom d’utilisateur est déjà pris.';
                            }
                        });
                    }
                }
            });
        
            await Promise.all(validations);
            return Object.keys(this.errors).length === 0;
        }
        
        // Exemple de méthode pour vérifier la disponibilité d'un nom d'utilisateur
        // async checkUsernameAvailability(username) {
        //     // Remplace ceci par ta logique de requête AJAX/HTTP fetch
        //     // Ici, un exemple qui simule une réponse après un délai
        //     return new Promise(resolve => setTimeout(() => resolve(false), 500)); // Simule un nom d'utilisateur déjà pris
        // }
    }
})();