const models = require('../../models');

//redis로 접속
const redis = require('redis');
const redisClient = redis.createClient();

redisClient.on('error', function (err) {
    console.log('Error ' + err);
});
//redis로 접속

//promise
const getAsync = (key) => new Promise((resolve, reject) => {
    redisClient.get(key, (err, data) => {
        if (data) {
            resolve(data)
        } else {
            reject(null)
        }
    });
})
//promise


exports.get_products = async (_, res) => {

    let results = JSON.parse(await getAsync("products:all"));

    const products = await models.Products.findAll();


    //레디스에 캐슁이 없으면 findall로 데이터 불러오기
    if (!results) {
        results = products
    } else {

    }


    res.render('admin/products.html', { products: results });
}

exports.get_products_write = (_, res) => {
    res.render('admin/write.html');
}


//작성하는 시점에 전체데이터를 가지고 와야한다
exports.post_products_write = async (req, res) => {

    await models.Products.create({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description
    })

    const products = await models.Products.findAll();

    redisClient.set('products:all', JSON.stringify(products));

    res.redirect('/admin/products');

}

exports.get_products_detail = (req, res) => {
    models.Products.findByPk(req.params.id).then((product) => {
        res.render('admin/detail.html', { product: product });
    });
};

exports.get_products_edit = (req, res) => {
    //기존에 폼에 value안에 값을 셋팅하기 위해 만든다.
    models.Products.findByPk(req.params.id).then((product) => {
        res.render('admin/write.html', { product: product });
    });
};

exports.post_products_edit = (req, res) => {

    models.Products.update(
        {
            name: req.body.name,
            price: req.body.price,
            description: req.body.description
        },
        {
            where: { id: req.params.id }
        }
    ).then(() => {
        res.redirect('/admin/products/detail/' + req.params.id);
    });

}

exports.get_products_delete = (req, res) => {
    models.Products.destroy({
        where: {
            id: req.params.id
        }
    }).then(() => {
        res.redirect('/admin/products');
    });
};