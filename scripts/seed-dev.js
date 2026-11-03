// Dados de teste para desenvolvimento: npm run seed
// Idempotente: produtos de teste têm o prefixo "[Teste]" e são recriados a cada execução.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../src/database/mysql').promise();

const img = (p) => fs.readFileSync(path.join(__dirname, '..', 'public', 'images', p));
const imagens = [
    img('products/GoldenSenior.png'),
    img('products/GoldenSpecial.png'),
    img('icons/petshop-section/dog-petshop.png'),
    img('icons/petshop-section/cat-petshop.png'),
];

const catalogo = {
    'Ração': ['Golden Sênior 15kg', 'Golden Special 20kg', 'Ração Gatos Castrados 10kg', 'Ração Filhotes 3kg', 'Sachê Gatos 85g'],
    'Brinquedos': ['Bolinha de Borracha', 'Corda com Nó', 'Ratinho de Pelúcia', 'Mordedor Osso', 'Arranhador Gatos'],
    'Acessórios': ['Coleira Ajustável', 'Peitoral Passeio', 'Guia Retrátil', 'Caminha Média', 'Comedouro Inox'],
    'Higiene': ['Shampoo Neutro 500ml', 'Tapete Higiênico 30un', 'Escova Dental Pet', 'Condicionador 500ml', 'Areia Higiênica 4kg'],
    'Medicamentos': ['Vermífugo Cães', 'Antipulgas Gatos', 'Suplemento Vitamínico', 'Pomada Cicatrizante', 'Colírio Pet'],
};

async function main() {
    await db.query("DELETE FROM produto WHERE nome LIKE '[Teste]%'");
    let n = 0;
    for (const [categoria, nomes] of Object.entries(catalogo)) {
        for (const nome of nomes) {
            const nomeFinal = `[Teste] ${nome}`;
            const preco = (19.9 + n * 7.35).toFixed(2);
            const [r] = await db.query(
                `INSERT INTO produto (nome, preco, categoria, short_description, long_description, main_image, main_alt_image)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [nomeFinal, preco, categoria, `${nome} - produto de teste da categoria ${categoria}`,
                 `<h2>${nome}</h2><p>Descrição longa de teste para <strong>${nome}</strong>.</p><ul><li>Item 1</li><li>Item 2</li></ul>`,
                 imagens[n % imagens.length], nomeFinal]
            );
            // Só alguns produtos têm imagens extras, para testar os dois cenários da galeria
            if (n % 3 === 0) {
                await db.query('INSERT INTO produto_image (fk_produto, image, alt, ordem) VALUES (?, ?, ?, 1), (?, ?, ?, 2)',
                    [r.insertId, imagens[n % imagens.length], `${nomeFinal} 1`, r.insertId, imagens[(n + 1) % imagens.length], `${nomeFinal} 2`]);
            }
            n++;
        }
    }
    console.log(`${n} produtos de teste criados.`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => db.end());
