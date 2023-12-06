const { Telegraf } = require("telegraf")
const { Markup } = require("telegraf")
const { Client } = require("pg")
require('dotenv').config()

const bot = new Telegraf(process.env.TOKEN)
const db = new Client({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT
})
const vsBotUsers = {}

db.connect()

function createTableUsers(){
    const query = `CREATE TABLE "User"(
        id bigint PRIMARY KEY,
        status varchar(255),
        choose varchar(255)
    );`
    db.query(query,(err,res)=>{
        console.log(err)
    })
}

function createTableRooms(){
    const query = `CREATE TABLE "Rooms"(
        id SERIAL PRIMARY KEY,
        first_player_id bigint,
        second_player_id bigint,
        current_player bigint,
        math_map text[][]
    );`
    db.query(query,(err,res)=>{
        console.log(err) 
    })
}

// createTableRooms()   
// createTableUsers()

function getUser(user_id,callback){
    const query = `SELECT * FROM "User" WHERE id = ${user_id}`
    db.query(query,(err,res)=>{
        callback(res.rows)
    })
}

function getRoom(room_id,callback){
    const query = `SELECT * FROM "Rooms" WHERE id = ${room_id}`
    db.query(query,(err,res)=>{
        console.log(err)
        console.log(res)
        callback(res.rows)
    })
}

function getCurrentPlayer(room_id,callback){
    const query = `SELECT current_player FROM "Rooms" WHERE id = ${room_id}`
    db.query(query,(err,res)=>{
        console.log(err)
        console.log(res)
        callback(res.rows)
    })
}

function addUser(user_id){
    const query = `INSERT INTO "User"(id,status) VALUES(${user_id},'standart')`
    db.query(query)
}

function addRoom(first_player_id, second_player_id,callback){
    const query = `INSERT INTO "Rooms"(first_player_id,second_player_id,current_player,math_map) VALUES(${first_player_id},${second_player_id},${first_player_id},'{{NaN,NaN,NaN},{NaN,NaN,NaN},{NaN,NaN,NaN}}') RETURNING id;`
    db.query(query,(err,res)=>{
        console.log(err)
        console.log(res)
        callback(res.rows)
        
    })
}

function updateStatus(user_id,status){
    const query = `UPDATE "User" SET status = '${status}' WHERE id = ${user_id}`
    db.query(query)
}

function updateChoose(user_id,choose){
    const query = `UPDATE "User" SET choose = '${choose}' WHERE id = ${user_id}`
    db.query(query)
}

function updateCurrentPlayer(room_id,current_player_id){
    const query = `UPDATE "Rooms" SET current_player = ${current_player_id} WHERE id = ${room_id}`
    db.query(query,(err,res)=>{
        console.log(err)
    })
}

function deleteRoom(room_id){
    const query = `DELETE FROM "Rooms" WHERE id = ${room_id}`
    db.query(query)
}

function getRandomInt(min, max,callback) {

    min = Math.ceil(min);
    max = Math.floor(max);

    let number = Math.floor(Math.random() * (max - min + 1)) + min
    callback(number)
}

function win(mathMap){
    
    let cellCount = 0
    console.log(mathMap)
    for(let row of mathMap){
        for (let cell of row){
            if (cell != "NaN" && cell){
                cellCount ++
            }
        }
    }
    
    if ((mathMap[0][0] == mathMap[0][1] && (mathMap[0][0] == mathMap[0][2]) && mathMap[0][0] == '1' )|| 
        (mathMap[1][0] == mathMap[1][1] && (mathMap[1][0] == mathMap[1][2]) && mathMap[1][0] == '1' )||
        (mathMap[2][0] == mathMap[2][1] && (mathMap[2][0] == mathMap[2][2]) && mathMap[2][0] == '1' )||

        (mathMap[0][0] == mathMap[1][0] && (mathMap[0][0] == mathMap[2][0]) && mathMap[0][0] == '1' )||
        (mathMap[0][1] == mathMap[1][1] && (mathMap[0][1] == mathMap[2][1]) && mathMap[0][1] == '1' )||
        (mathMap[0][2] == mathMap[1][2] && (mathMap[0][2] == mathMap[2][2]) && mathMap[0][2] == '1' )||

        (mathMap[0][0] == mathMap[1][1] && (mathMap[0][0] == mathMap[2][2]) && mathMap[0][0] == '1' )||
        (mathMap[0][2] == mathMap[1][1] && (mathMap[0][2] == mathMap[2][0]) && mathMap[0][2] == '1' )){
        return 1
    } else if ((mathMap[0][0] == mathMap[0][1] && (mathMap[0][0] == mathMap[0][2]) && mathMap[0][0] == '2' )|| 
        (mathMap[1][0] == mathMap[1][1] && (mathMap[1][0] == mathMap[1][2]) && mathMap[1][0] == '2' )||
        (mathMap[2][0] == mathMap[2][1] && (mathMap[2][0] == mathMap[2][2]) && mathMap[2][0] == '2' )||

        (mathMap[0][0] == mathMap[1][0] && (mathMap[0][0] == mathMap[2][0]) && mathMap[0][0] == '2' )||
        (mathMap[0][1] == mathMap[1][1] && (mathMap[0][1] == mathMap[2][1]) && mathMap[0][1] == '2' )||
        (mathMap[0][2] == mathMap[1][2] && (mathMap[0][2] == mathMap[2][2]) && mathMap[0][2] == '2' )||

        (mathMap[0][0] == mathMap[1][1] && (mathMap[0][0] == mathMap[2][2]) && mathMap[0][0] == '2' )||
        (mathMap[0][2] == mathMap[1][1] && (mathMap[0][2] == mathMap[2][0]) && mathMap[0][2] == '2' )){
        return 2
    } else if (cellCount == 9){
        return 3 
    }
}

function draw(mathMap,mode,callback,room_id){
    let replyMessage = []
    let index = 0
    if (mode == "bot"){
        for(row of mathMap){
            for(cell of row){
                if(!cell){
                    replyMessage.push(Markup.button.callback("•",`none${index}`))
                } else if(cell == 1){
                    replyMessage.push(Markup.button.callback("X",1))
                } else if(cell == 2){
                    replyMessage.push(Markup.button.callback("O",2))
                }
                index++
            }
        }
    } else if(mode == "onedevice"){
        for(row of mathMap){
            for(cell of row){
                if(!cell){
                    replyMessage.push(Markup.button.callback("•",`none${index+9}`))
                } else if(cell == 1){
                    replyMessage.push(Markup.button.callback("X",1))
                } else if(cell == 2){
                    replyMessage.push(Markup.button.callback("O",2))
                }
                index++
            }
        }
    } else if(mode == "multiplayer"){
        for(row of mathMap){
            for(cell of row){
                if(cell=="NaN"){
                    console.log(room_id)
                    replyMessage.push(Markup.button.callback("•",`${room_id}|${index}`))
                } else if(cell == 1){
                    replyMessage.push(Markup.button.callback("X",1))
                } else if(cell == 2){
                    replyMessage.push(Markup.button.callback("O",2))
                }
                index++
            }
        }
    }
    
    callback(replyMessage)
}

function botChoose(mathMap,user_choose,callback){
    console.log("CHOOSE STARTED")
    getRandomInt(0,8,(randomNumber)=>{
        console.log("IN GETRANDOMINT")
        let index = 0
        for(let row of mathMap){
            for(let cell of row){
                if(`${cell}` != 'NaN'){
                    index ++
                }
            }
        }
        if(index == 9){
            console.error("botChoose error!")
        } else {
            console.log(randomNumber)
            if(randomNumber == 0 || randomNumber == 1 || randomNumber == 2 ){
                if(`${mathMap[0][randomNumber]}` != "NaN"){
                    botChoose(mathMap,user_choose,callback)
                } else {
                    if(user_choose == "X"){
                        mathMap[0][randomNumber] = 2
                        console.log(mathMap)
                        console.log(callback)
                        callback(mathMap)
                    } else {
                        mathMap[0][randomNumber] = 1
                        console.log(mathMap)
                        console.log(callback)
                        callback(mathMap)
                    }
                }
            } else if(randomNumber == 3 || randomNumber == 4 || randomNumber == 5 ){
                if(`${mathMap[1][randomNumber-3]}` != "NaN"){
                    botChoose(mathMap,user_choose,callback)
                } else {
                    if(user_choose == "X"){
                        mathMap[1][randomNumber-3] = 2
                        console.log(mathMap)
                        console.log(callback)
                        callback(mathMap)
                    } else {
                        mathMap[1][randomNumber-3] = 1
                        console.log(mathMap)
                        console.log(callback)
                        callback(mathMap)
                    }
                }
            } else if(randomNumber == 6 || randomNumber == 7 || randomNumber == 8){
                if(`${mathMap[2][randomNumber-6]}` != "NaN"){
                    botChoose(mathMap,user_choose,callback)
                } else {
                    if(user_choose == "X"){
                        mathMap[2][randomNumber-6] = 2
                        console.log(mathMap)
                        callback(mathMap)
                    } else {
                        mathMap[2][randomNumber-6] = 1
                        console.log(mathMap)
                        // console.log(callback)
                        callback(mathMap)
                    }
                }
            }
        }
    })
}

function updatePlayers(callback){
    const query = `SELECT id FROM "User" WHERE status = 'in_search'`
    db.query(query,(err,res)=>{
        // console.log(res)
        callback(res.rows)
    })
}

function vsBot(){
    for(let button = 0; button < 9; button++){
        bot.action(`none${button}`,(ctx)=>{
            // console.log("ACTION")
            getUser(ctx.from.id,(user)=>{
                console.log(user)
                if(user.length > 0){
                    // console.log("USER")
                    if(vsBotUsers[ctx.from.id]){
                        // console.log("MATHMAP EXIST")
                        console.log(user)
                        if(user[0].choose == "X"){
                            console.log("USER CHOOSE X")
                            if(button == 0 || button == 1 || button == 2 && `${vsBotUsers[ctx.from.id][0][button]}` == "NaN"){
                                vsBotUsers[ctx.from.id][0][button] = 1
                            } else if(button == 3 || button == 4 || button == 5 && `${vsBotUsers[ctx.from.id][1][button-3]}` == "NaN"){
                                vsBotUsers[ctx.from.id][1][button-3] = 1
                            } else if(button == 6 || button == 7 || button == 8 && `${vsBotUsers[ctx.from.id][2][button-6]}` == "NaN"){
                                vsBotUsers[ctx.from.id][2][button-6] = 1
                            }
                            if(!win(vsBotUsers[ctx.from.id])){
                                console.log("!WIN")
                                botChoose(vsBotUsers[ctx.from.id],user[0].choose,(mathMap)=>{
                                    console.log("BOT CHOOSED")
                                    vsBotUsers[ctx.from.id] = mathMap
                                    if(!win(vsBotUsers[ctx.from.id])){
                                        draw(vsBotUsers[ctx.from.id],"bot",(map)=>{
                                            ctx.editMessageReplyMarkup(Markup.inlineKeyboard(map,{columns:3}).reply_markup)
                                        })
                                    } else {
                                        if(win(vsBotUsers[ctx.from.id]) == 1){
                                            ctx.editMessageText("Вітаю ви перемогли!")
                                            updateStatus(ctx.from.id,"standart")
                                            updateChoose(ctx.from.id,undefined)
                                        } else if(win(vsBotUsers[ctx.from.id]) == 2){
                                            ctx.editMessageTextply("Ви програли (")
                                            updateStatus(ctx.from.id,"standart")
                                            updateChoose(ctx.from.id,undefined)
                                        }else if(win(vsBotUsers[ctx.from.id]) == 3){
                                            ctx.editMessageText("Не має переможця")
                                            updateStatus(ctx.from.id,"standart")
                                            updateChoose(ctx.from.id,undefined)
                                        }
                                    }
                                })
                            } else {

                                if(win(vsBotUsers[ctx.from.id]) == 1){
                                    ctx.editMessageText("Вітаю ви перемогли!")
                                    updateStatus(ctx.from.id,"standart")
                                    updateChoose(ctx.from.id,undefined)
                                } else if(win(vsBotUsers[ctx.from.id]) == 2){
                                    ctx.editMessageText("Ви програли (")
                                    updateStatus(ctx.from.id,"standart")
                                    updateChoose(ctx.from.id,undefined)
                                }else if(win(vsBotUsers[ctx.from.id]) == 3){
                                    ctx.editMessageText("Не має переможця")
                                    updateStatus(ctx.from.id,"standart")
                                    updateChoose(ctx.from.id,undefined)
                                }
                            }
                        } else if(user[0].choose == "O"){
                            if(button == 0 || button == 1 || button == 2 && `${vsBotUsers[ctx.from.id][0][button]}` == "NaN"){
                                vsBotUsers[ctx.from.id][0][button] = 2
                            } else if(button == 3 || button == 4 || button == 5 && `${vsBotUsers[ctx.from.id][1][button-3]}` == "NaN"){
                                vsBotUsers[ctx.from.id][1][button-3] = 2
                            } else if(button == 6 || button == 7 || button == 8 && `${vsBotUsers[ctx.from.id][2][button-6]}` == "NaN"){
                                vsBotUsers[ctx.from.id][2][button-6] = 2
                            } else {
                                return
                            }
                            if(!win(vsBotUsers[ctx.from.id])){
                                botChoose(vsBotUsers[ctx.from.id],user[0].choose,(mathMap)=>{
                                    vsBotUsers[ctx.from.id] = mathMap
                                    if(!win(vsBotUsers[ctx.from.id])){
                                        draw(vsBotUsers[ctx.from.id],"bot",(map)=>{
                                            ctx.editMessageReplyMarkup(Markup.inlineKeyboard(map,{columns:3}).reply_markup)
                                        })
                                    } else {
                                        if(win(vsBotUsers[ctx.from.id]) == 2){
                                            ctx.editMessageText("Вітаю ви перемогли!")
                                            updateStatus(ctx.from.id,"standart")
                                            updateChoose(ctx.from.id,undefined)
                                        } else if(win(vsBotUsers[ctx.from.id]) == 1){
                                            ctx.editMessageText("Ви програли (")
                                            updateStatus(ctx.from.id,"standart")
                                            updateChoose(ctx.from.id,undefined)
                                        }else if(win(vsBotUsers[ctx.from.id]) == 3){
                                            ctx.editMessageText("Не має переможця")
                                            updateStatus(ctx.from.id,"standart")
                                            updateChoose(ctx.from.id,undefined)
                                        }
                                    }
                                })
                            } else {
                                if(win(vsBotUsers[ctx.from.id]) == 2){
                                    ctx.editMessageText("Вітаю ви перемогли!")
                                    updateStatus(ctx.from.id,"standart")
                                    updateChoose(ctx.from.id,undefined)
                                } else if(win(vsBotUsers[ctx.from.id]) == 1){
                                    ctx.editMessageText("Ви програли (")
                                    updateStatus(ctx.from.id,"standart")
                                    updateChoose(ctx.from.id,undefined)
                                }else if(win(vsBotUsers[ctx.from.id]) == 3){
                                    ctx.editMessageText("Не має переможця")
                                    updateStatus(ctx.from.id,"standart")
                                    updateChoose(ctx.from.id,null)
                                }
                            }
                        }
                        
                    }
                }
            })
        })
    }
}

function multiplayer(room_id){
    getRoom(room_id.id,(room)=>{
        console.log(room)
        let mark = 1
        
        for(let button = 0; button < 9; button ++){
            bot.action(`${room[0].id}|${button}`,(ctx)=>{
                getCurrentPlayer(room_id.id,(current_player)=>{
                    if(ctx.from.id == current_player[0].current_player){
                        if(button == 0 || button == 1 || button == 2 && `${room[0].math_map[0][button]}` == "NaN"){
                            room[0].math_map[0][button] = mark
                            if(current_player[0].current_player == room[0].first_player_id){
                                updateCurrentPlayer(room_id.id,room[0].second_player_id)
                                mark = 2
                            } else if(current_player[0].current_player == room[0].second_player_id){
                                updateCurrentPlayer(room_id.id,room[0].first_player_id)
                                mark = 1
                            }
                        } else if(button == 3 || button == 4 || button == 5 && `${room[0].math_map[1][button-3]}` == "NaN"){
                            room[0].math_map[1][button-3] = mark
                            if(current_player[0].current_player == room[0].first_player_id){
                                updateCurrentPlayer(room_id.id,room[0].second_player_id)
                                mark = 2
                            } else if(current_player[0].current_player == room[0].second_player_id){
                                updateCurrentPlayer(room_id.id,room[0].first_player_id)
                                mark = 1
                            }
                        } else if(button == 6 || button == 7 || button == 8 && `${room[0].math_map[2][button-6]}` == "NaN"){
                            room[0].math_map[2][button-6] = mark
                            if(current_player[0].current_player == room[0].first_player_id){
                                updateCurrentPlayer(room_id.id,room[0].second_player_id)
                                mark = 2
                            } else if(current_player[0].current_player == room[0].second_player_id){
                                updateCurrentPlayer(room_id.id,room[0].first_player_id)
                                mark = 1
                            }
                        }
                        if(!win(room[0].math_map)){
                            draw(room[0].math_map,"multiplayer",(map)=>{
                                console.log(current_player[0].current_player)
                                if(current_player[0].current_player == room[0].first_player_id){
                                    bot.telegram.sendMessage(room[0].first_player_id,"Зараз хід супротивника:",Markup.inlineKeyboard(map,{columns:3}).resize())
                                    bot.telegram.sendMessage(room[0].second_player_id,"Зараз ваш хід:",Markup.inlineKeyboard(map,{columns:3}).resize())
                                } else if(current_player[0].current_player == room[0].second_player_id) {
                                    console.log(2222222222222222222222222222222222222222222)
                                    bot.telegram.sendMessage(room[0].first_player_id,"Зараз ваш хід:",Markup.inlineKeyboard(map,{columns:3}).resize())
                                    bot.telegram.sendMessage(room[0].second_player_id,"Зараз хід супротивника:",Markup.inlineKeyboard(map,{columns:3}).resize())
                                }
                            },room_id.id)
                        } else {
                            if(win(room[0].math_map) == 1){
                                bot.telegram.sendMessage(room[0].first_player_id,"Ви перемогли!")
                                bot.telegram.sendMessage(room[0].second_player_id,"Ви програли :(")
                                deleteRoom(room_id.id)
                                updateStatus(room[0].first_player_id,"standart")
                                updateStatus(room[0].second_player_id,"standart")
                            } else if(win(room[0].math_map) == 2){
                                bot.telegram.sendMessage(room[0].second_player_id,"Ви перемогли!")
                                bot.telegram.sendMessage(room[0].first_player_id,"Ви програли :(")
                                deleteRoom(room_id.id)
                                updateStatus(room[0].first_player_id,"standart")
                                updateStatus(room[0].second_player_id,"standart")
                            } if(win(room[0].math_map) == 3){
                                bot.telegram.sendMessage(room[0].first_player_id,"Не має переможця")
                                bot.telegram.sendMessage(room[0].second_player_id,"Не має переможця")
                                deleteRoom(room_id.id)
                                updateStatus(room[0].first_player_id,"standart")
                                updateStatus(room[0].second_player_id,"standart")
                            }
                        }
                    }
                })
            })
        }
    })
}

bot.start((ctx)=>{
    console.log("start")
    getUser(ctx.from.id,(res)=>{
        if(res.length <= 0){
            addUser(ctx.from.id)
            ctx.reply("Вітаю! Оберіть режим гри:",Markup.keyboard([
                Markup.button.callback("Гра проти бота"),
                Markup.button.callback("Мультиплеєр")
            ]))
        } else if(res[0].status == "standart"){
            ctx.reply("Вітаю! Оберіть режим гри:",Markup.keyboard([
                Markup.button.callback("Гра проти бота"),
                Markup.button.callback("Мультиплеєр")
            ]))
        }
    })
})

bot.hears("Гра проти бота",(ctx)=>{
    getUser(ctx.from.id,(res)=>{
        if(res.length > 0){
            if(res[0].status == "standart"){
                updateStatus(ctx.from.id,"vsBot")
                ctx.reply("Оберіть сторону за яку ви бажаєте грати:",Markup.inlineKeyboard([
                    Markup.button.callback("X","vsBotCross"),
                    Markup.button.callback("O","vsBotZero")
                ]))
            }
        }
    })
})
    
bot.action("vsBotCross",(ctx)=>{
    getUser(ctx.from.id,(res)=>{
        if(res.length > 0){
            if(res[0].status == "vsBot"){
                if(res.choose != "X"){
                    updateChoose(ctx.from.id,"X")
                }
                vsBotUsers[ctx.from.id] = [
                    [NaN,NaN,NaN],
                    [NaN,NaN,NaN],
                    [NaN,NaN,NaN]
                ]
                
                draw(vsBotUsers[ctx.from.id],'bot',(map)=>{
                    ctx.reply("Оберіть позицію:",Markup.inlineKeyboard(map,{columns:3}))
                    vsBot()
                })
            }
        }
    })
})

bot.action("vsBotZero",(ctx)=>{
    getUser(ctx.from.id,(res)=>{
        if(res.length > 0){
            if(res[0].status == "vsBot"){
                if(res.choose != "O"){
                    updateChoose(ctx.from.id,"O")
                }
                vsBotUsers[ctx.from.id] = [
                    [NaN,NaN,NaN],
                    [NaN,NaN,NaN],
                    [NaN,NaN,NaN]
                ]
                botChoose(vsBotUsers[ctx.from.id],"O",(mathMap)=>{
                    vsBotUsers[ctx.from.id] = mathMap
                    draw(vsBotUsers[ctx.from.id],'bot',(map)=>{
                        ctx.reply("Оберіть позицію:",Markup.inlineKeyboard(map,{columns:3}))
                        vsBot()
                    })
                })
            }
        }
    })
})

bot.action('updateList',(ctx)=>{
    updatePlayers(async(users)=>{
        let replyMessage = []
        
        for(let user of users){
            console.log(user)
            await bot.telegram.getChat(user.id).then((value)=>{
                if(value.id != ctx.from.id){
                    replyMessage.push(Markup.button.callback(`${value.first_name}|${value.last_name}|${value.username}`,`${value.id}`))
                }
            })
        }
        console.log(replyMessage)
        replyMessage.push(Markup.button.callback(`Оновити список`,`updateList`))
        replyMessage.push(Markup.button.callback(`Повернутися назад`,`back`))
        ctx.reply("Оберіть вашого опонента або зачекайте отримання запрошення:",Markup.inlineKeyboard(replyMessage,{columns:1}))
    })
})

bot.action('back',(ctx)=>{
    updateStatus(ctx.from.id,"standart")
    ctx.reply("Вітаю! Оберіть режим гри:",Markup.keyboard([
        Markup.button.callback("Гра проти бота"),
        Markup.button.callback("Мультиплеєр")
    ]))
})

bot.hears("Мультиплеєр",(ctx)=>{
    getUser(ctx.from.id,(res)=>{
        if(res.length > 0){
            if(res[0].status == "standart"){
                updateStatus(ctx.from.id,"in_search")
                updatePlayers(async(users)=>{
                    let replyMessage = []
                    
                    for(let user of users){
                        console.log(user)
                        await bot.telegram.getChat(user.id).then((value)=>{
                            if(value.id != ctx.from.id){
                                replyMessage.push(Markup.button.callback(`${value.first_name}|${value.last_name}|${value.username}`,`${value.id}`))
                            }
                            bot.action(`${value.id}`,(ctx1)=>{
                                let pl = ctx1.from.id
                                ctx1.reply("Очікуємо відповіді на запрошення...")
                                bot.telegram.sendMessage(value.id,`Користувач ${ctx1.from.first_name} ${ctx1.from.last_name} запрошує вас`,Markup.inlineKeyboard([
                                    Markup.button.callback("Прийняти",`accept${ctx1.from.id}`),
                                    Markup.button.callback("Відмовити",`decline${ctx1.from.id}`)
                                ]).oneTime(true))
                                bot.action(`accept${ctx1.from.id}`,(ctx)=>{
                                    ctx.editMessageText("Ви прийняли запрошення")
                                    ctx1.reply("Користувач прийняв ваше запрошення")
                                    addRoom(ctx.from.id,pl,(room_id)=>{
                                        updateStatus(ctx.from.id,"in_game")
                                        updateStatus(pl,"in_game")
                                        draw([["NaN","NaN","NaN"],["NaN","NaN","NaN"],["NaN","NaN","NaN"]],"multiplayer",(map)=>{
                                            bot.telegram.sendMessage(ctx.from.id,"Зараз ваш хід:",Markup.inlineKeyboard(map,{columns:3}).resize())
                                            bot.telegram.sendMessage(pl,"Зараз хід супротивника:",Markup.inlineKeyboard(map,{columns:3}).resize())
                                        },room_id[0].id)
                                        multiplayer(room_id[0])
                                    })
                                })
                                bot.action(`decline${ctx1.from.id}`,(ctx)=>{
                                    ctx.editMessageText("Ви відмовили користувачу")
                                    bot.telegram.sendMessage(pl,"Користувач відмовив вам у грі")
                                })
                            })
                        })
                    }
                    console.log(replyMessage)
                    replyMessage.push(Markup.button.callback(`Оновити список`,`updateList`))
                    replyMessage.push(Markup.button.callback(`Повернутися назад`,`back`))
                    ctx.reply("Оберіть вашого опонента або зачекайте отримання запрошення:",Markup.inlineKeyboard(replyMessage,{columns:1}))
                })
            }
        }
    })
})

bot.launch()