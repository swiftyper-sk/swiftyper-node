# Swiftyper Node.js Library

## Dokumentácia

[`swiftyper-node` API dokumentácia](https://developers.swiftyper.sk/docs/api/node) pre Node.js.

## Požiadavky

Node 8, 10+.

## Inštalácia

```sh
npm install swiftyper-node --save
# alebo
yarn add swiftyper-node
```

## Použitie

Pred začatím používania je nutné nastaviť API kľúč ktorý môžete spravovať cez Váš [používateľský účet](https://manage.swiftyper.sk/dashboard).

**API kľúče sú predvolene neobmedzené.** Neobmedzené kľúče nie sú bezpečné, pretože ich môže používať ktokoľvek a odkiaľkoľvek. Pre produkčné aplikácie odporúčame nastaviť obmedzenia API kľúča nakoľko pomáhajú zabrániť neoprávnenému použitiu a vyčerpávaniu kvót. Obmedzenia určujú, ktoré webové stránky alebo IP adresy môžu používať API kľúč.
```js
const swiftyper = require('swiftyper-node')('VÁŠ_API_KĽÚČ_SLUŽBY_BUSINESS');

swiftyper.business.query({query: 'Google Slovakia', country: 'SK'})
  .then(business => console.log(business))
  .catch(error => console.error(error));

// alebo bez použitia then/catch

swiftyper.business.detail('sk_WbilvhDEDokFTWk0FbNjeQ', function(err, result) {
  console.error(err);
  console.log(result);
})
```

Alebo s použitím `async`/`await`:

```js
import Swiftyper from 'swiftyper-node';
const swiftyper = new Swiftyper('VÁŠ_API_KĽÚČ_SLUŽBY_PLACES');

(async () => {
  const address = await swiftyper.places.detail('sk_m16ZZTrfCm2Rfnm6oN7oeA');

  console.log(address);
})();
```

## Konfigurácia

### Inicializácia pomocou konfiguračného objektu

```js
const swiftyper = Swiftyper('VÁŠ_API_KĽÚČ', {
  maxNetworkRetries: 1,
  timeout: 1000,
  host: 'api.mojafirma.sk',
  port: 443,
});
```

| Nastavenie          | Predvolené           | Popis                                                                                                       |
| ------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------- |
| `maxNetworkRetries` | 0                    | Počet opakovaní v prípade zlyhania požiadavky.                                                              |
| `timeout`           | 8000                 | Maximálny čas na spracovanie požiadavky uvádzaný v ms.                                                      |
| `host`              | `'api.swiftyper.sk'` | Hostiteľ, na ktorého sa odosielajú požiadavky.                                                              |
| `port`              | 443                  | Port, na ktorý sa odosielajú požiadavky.                                                                    |
| `protocol`          | `'https'`            | `'https'` alebo `'http'`. Požiadavky na naše servery musia byť smerované prostredníctvom protokolu `https`. |


