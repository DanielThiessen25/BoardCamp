import express from 'express';
import pg from 'pg';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const { Pool } = pg;

const connection = new Pool({
  user: 'bootcamp_role',
  password: 'senha_super_hiper_ultra_secreta_do_role_do_bootcamp',
  host: 'localhost',
  port: 5432,
  database: 'boardcamp'
});

let categorias = [];
let existeCategoria = false;
loadCategorias();

async function loadCategorias(){
    const result = await connection.query('SELECT * FROM categories');
    if(result.row != []){
        categorias = [...result.rows];
        console.log(categorias);
    }
    return result.rows;
}

function verificarCategoria(categoria){
    if(categorias.length != 0){
        for(let i =0; i<categorias.length; i++){
            if(categoria === categorias[i]){
                existeCategoria = true;
            }
        }

    }
    else{
        existeCategoria = false;
    }
    
    
}

app.get('/categories', (req, res) => {
        const result = loadCategorias();
        res.send(result);
      });

app.post('/categories', async (req, res) =>{
    const {name} = req.body;
    verificarCategoria(name);
    if(name == '' || existeCategoria == true){
        if(existeCategoria){
            res.status(409).end();
        }
        else{
            res.status(400).end();
        }
        
    }
    else{
        try{
            const result = await connection.query('INSERT INTO categories (name) VALUES ($1)', [name]);
            res.status(200).end();

        }catch(error){
            res.status(500).end();
        }
    }
    
});

app.listen(4000, () => {
    console.log('Server listening on port 4000.');
  });
