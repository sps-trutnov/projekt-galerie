const express = require('express');
const session = require('express-session');
const dbModel = require(require('path').join(__dirname, '..', 'models', 'dbModel'));
const multer = require('multer');
const { Script } = require('vm');

exports.upload = (req, res) => {
    res.render('admin/upload_form');
}

exports.admin = (req, res) => {
    res.render('admin/admin_page');
}
exports.adminEdit = (req, res) => {
    res.render('admin/edit');
}

exports.getArticleData = (req, res) => {
    var name = req.params.article;
    var data = dbModel.nacist(name);
    res.send(data);
}
exports.getArticleNames = (req, res) => {
    res.send(dbModel.getArticleNames());
}
exports.getArticleTitles = (req, res) => {
    res.send(dbModel.getArticleTitles());
}
exports.editArticle = (req, res) => {
    var id = req.body[0];
    var items = req.body[1];
    dbModel.editArticle(id, items);
    res.send({"msg":"Článek změněn!"});
}

exports.deleteArticle = (req, res) => {
    var id = req.body.ID;
    var odpoved = dbModel.deleteArticle(id);
    var msg = {};
    switch(odpoved) {
        case true: {
            msg = {"msg":"Clanek byl vymazan uspesne."};
            break;
        }
        case undefined: {
            msg = {"msg":"Clanek nenalezen."};
            break;
        }
        default: {
            msg = {"msg":"Neznama chyba"};
            break;
        }
    }
    res.send(msg);
}

exports.postLoginInfo = (req, res) => {
    req.session.username = req.body.username;
    req.session.password = req.body.password;
    console.log('loginAdmin Sekce --------------------')
    
    res.send({"status":100})
}
exports.compareAdmin = (req, res, next) => {
    dbModel.compareAdmin(req, res, next);
}
exports.pre_upload = (req, res,next) => 
{
    next();
}
exports.uploadImg = (req, res,next) => {
    const upload = multer({
        storage: multer.diskStorage({
            destination: './app/www/img/' + dbModel.dalsi_ID(),
            filename: (req, file, res) => {
                res(null, file.originalname)
            }
        }),
        fileFilter: function(req, file, cb){
            const fileTypes = /jpeg|jpg|png/;
            const mimeType = fileTypes.test(file.mimetype);
            if(mimeType){
                cb(null, true);
            } 
            else {
                cb('error');
            }
        }
    }).array('image');
    upload(req, res, (err) => {
        if(err){
            
        }else
        {   
            console.log(req.files);
            res.locals.nazvy_souboru=[];
            for(let i in req.files)
                res.locals.nazvy_souboru.push(req.files[i].originalname);  
        }
        next();
    });
}
exports.uploadArticle = (req, res,next) => {
    console.log(res.locals.nazvy_souboru);
    let name = req.body.nazev;
    let desc_short = req.body.kratky_popis;
    let desc_full = req.body.dlouhy_popis;
    let author = req.body.autori;
    let tags = req.body.tagy;
    let obrazky = res.locals.nazvy_souboru;
    let hodnoceniLike = 0;
    let hodnoceniDislike = 0;
    
    dbModel.newDbItem(name, desc_short, desc_full, author, tags,obrazky, hodnoceniLike, hodnoceniDislike);
    return res.redirect('/admin/edit')
}
exports.detail = (rq, res) =>
{
    let id = rq.params.id;
    var data = dbModel.nacistDetail(id);
    res.render('projekty/detail', {data, id});
}

exports.hodnoceni = (rq, res) =>
{
    var susenky = rozdelitCookie(rq);
    if(rq.headers.cookie == undefined)
    {
        res.cookie(rq.body.id, "zahlasovano" + rq.body.id);      
            dbModel.aktualizovatHodnoceni(rq.body.id, rq.body.hodnoceni);
            return res.send({"msg":{"status":1}})
    }
    else
    {
        for (i in susenky){
            if(susenky[rq.body.id] != "zahlasovano" + rq.body.id)
            {
                res.cookie(rq.body.id, "zahlasovano" + rq.body.id);      
                dbModel.aktualizovatHodnoceni(rq.body.id, rq.body.hodnoceni);
                return res.send({"msg":{"status":1}})
            }
            else
            {
                return res.send({"msg":{"status":2}})
            }
        }
    }
    res.send('Vsechno OK!'); 
}

function rozdelitCookie (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

exports.logout = (req, res) => {
    req.session.username = undefined;
    req.session.password = undefined;
    req.session.userid = undefined;
    return res.send({"msg":{"status":100, "text":"Úspěšně odhlášeno!"}})
}
