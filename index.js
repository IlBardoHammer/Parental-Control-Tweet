/*
Express è un framework per applicazioni web in Node.js flessibile e leggero; fornisce una serie di funzioni avanzate per le applicazioni web e per dispositivi mobili.
Fornisce molti metodi di utilità HTTP, middleware e per la creazione di API affidabili.
Express fornisce uno strato di funzionalità di base per le applicazioni web, senza nascondere le funzioni Node.js.
* */
const express = require('express');
const app = express();
const port = 3000;//porta su cui node sta in ascolto

const tf = require('@tensorflow/tfjs');//libreria tensorflow
const tf_tox = require('@tensorflow-models/toxicity'); //libreria toxicity

let model_result = null;

app.use(express.json())//middleware di express che recupera la request e la restituisce già in formato json
app.post('/', async (req, res) => {//route principale della API (in post)
    model_result = null;
    /*
    * async e await si basano sul meccanismo delle Promise e il loro risultato è compatibile con qualsiasi API che utilizza le Promise.
    * La parola chiave await sospende l'esecuzione di una funzione in attesa che la Promise associata ad un'attività asincrona venga risolta o rigettata.
    * */
    await model_call(req.body);//chiamata della funzione "model_call" in modalità sincrona (await) passando come parametro la richiesta
    res.send(model_result);//invio della risposta
});

async function model_call(sentences) {
    try {
        const threshold = 0.9;//definizione della soglia per il riconoscimento della tossicità da parte del modello di ML Toxicity
        await tf_tox.load(threshold).then(model => {//chiamata in modalità sincrona della funzione load di Toxicity
            let tox_result = tox_call(model, sentences);//chiamata della funzione tox_call passando come argomento il modello ML (Toxicity) e la frase da controllare
            return tox_result;
        }).catch((error) => {
            console.error(error);
        });
    } catch (e) {
        console.log(e);
    }
}

async function tox_call(model, sentences) {
    try {
        if (sentences && sentences.length > 0 && sentences["0"]) {//se esiste la frase e non è vuota
            await model.classify(sentences).then(predictions => {//invocazione del metodo classify di Toxicity; in prediction vengono passati i risultati del ML Toxicity
                model_result = predictions;
                return predictions;
            }).catch((error) => {
                console.error(error);
            });
        }
    } catch (e) {
        console.log(e);
    }
}

app.listen(port, () => console.log(`Parental Twitter control running at port: ${port}!`))//avvio di nodejs in ascolto sulla porta indicata