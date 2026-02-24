import { lib, game, ui, get, ai, _status } from "../../noname.js";
game.import("extension", function () {
    return {
        name: "LQZC2", 
        content: function (config, pack) {
        }, 
        precontent: function () {
        }, 
        help: {}, 
        config: {}, 
        package: {
            character: {
                character: {
                    "LQZC2_sxj": ["female", "wu", '3/6', ["sxj_jia2","qingnang","sxj_xinfuhan","sxj_chenglong","sxj_wuwei"], []],
                    "LQZC2_sxj2": ["female", "wu", '4/6', ["sxj_freechar"], []],
                },
                translate: { //sxj_freechar
                    "LQZC2_sxj": "SXJ",
                    "LQZC2_sxj2": "SXJ2",
                },
            },
            card: {
                card: {
                },
                translate: {
                },
                list: [],
            },
            skill: {
                skill: {
                    "sxj_jia2": {
                        trigger: {
                            global: "phaseBefore",
                            player: "enterGame",
                        },
                        forced: true,
                        filter(event, player) {
                            return (event.name != "phase" || game.phaseNumber == 0) && player.hasEnabledSlot(2);
                        },
                        content() {
                            player.expandEquip(2);
                            player.expandEquip(2);
                            player.expandEquip(1);
                            player.expandEquip(1);
                        },
                    },
                    "sxj_xinfuhan": {
                        enable: "phaseUse",
                        unique: true,
                        content: function () {
                            "step 0";
                            let list;
                            if (_status.characterlist) {
                                list = [];
                                for (let i = 0; i < _status.characterlist.length; i++) {
                                    let name = _status.characterlist[i];
                                    if (lib.character[name][1] == "shu") list.push(name);
                                }
                            } else if (_status.connectMode) {
                                list = get.charactersOL(function (i) {
                                    return lib.character[i][1] != "shu";
                                });
                            } else {
                                list = get.gainableCharacters(function (info) {
                                    return info[1] == "shu";
                                });
                            }
                            let players = game.players.concat(game.dead);
                            for (let i = 0; i < players.length; i++) {
                                list.remove(players[i].name);
                                list.remove(players[i].name1);
                                list.remove(players[i].name2);
                            }
                            list.remove("zhaoyun");
                            list.remove("re_zhaoyun");
                            list.remove("ol_zhaoyun");
                            list = list.randomGets(Math.max(5, game.countPlayer()));
                            //list = ['liubei','guanyu','huangyueying','baosanniang'];
                            let skills = [],
                                scnt=0, 
                                scnt_max=0;
                            for (let i of list) {
                                let skillOfi = (lib.character[i][3] || []).filter(function (skill) {
                                    let info = get.info(skill);
                                    return info && !info.zhuSkill && !info.limited && !info.juexingji && !info.hiddenSkill && !info.charlotte && !info.dutySkill;
                                });
                                skills.add(skillOfi);
                                scnt = scnt + skillOfi.length;
                                if(skillOfi.length>scnt_max) scnt_max = skillOfi.length;
                            }
                            if (!list.length || !scnt) {
                                event.finish();
                                return;
                            }
                            let list1 = [], buttonsList = [];
                            function create2DArray(rows, cols) {  //创建数组[rows,cols]
                                return Array.from({length:rows}, () => Array(cols).fill(0));
                            }
                            let grids = create2DArray(scnt_max, list.length);
                            for (let i = 0; i < list.length; i++) {
                                list1[i] = [list[i], 0, {noselect:false,link2:1234,nowidth:true,type2:'wujiang'}];
                                //if(i==2) list1[i][2].noselect = false;
                                for(let ii = 0; ii < skills[i].length; ii++){   //第ii行
                                    grids[ii][i] = skills[i][ii];
                                }
                            }
                            game.log(get.translation(player)+'->'+get.translation('test_xinbenxi'));
                            game.log('Grid:',grids);
                            game.log(scnt_max);    //'1fr 1fr 1fr 1fr'
                            game.log(list.length); //Array(list.length).fill('1fr').join(' ')
                            let gridCss = {
                                display : 'grid',
                                gridTemplateColumns : Array(list.length).fill('1fr').join(' '),
                                justifyContent: 'center'     //alignContent : 'center',
                            };
                            buttonsList.add('新UI：选择1~2个武将或1个技能');
                            buttonsList.add([list1,"character",{css2:gridCss}]);
                            for (let ii = 0; ii < scnt_max; ii++) {   //最多 scnt_max 行
                                let row = grids[ii];
                                let list2 = row.map(function(cur) {
                                    if(cur == 0) {
                                        return [cur, '0', {noselect:false,link2:null,isBlank:true,type2:'skill'}];
                                    } else {
                                        return [cur, get.translation(cur), {type2:'skill'}];
                                    }
                                });
                                buttonsList.add([list2,"tdnodes",{css2:gridCss}]);
                            }
                            ////
                            var next = player.chooseButton(buttonsList);
                            next.set("forced", true);
                            next.set("selectButton", [1, 3]);
                            next.set("filterButton", function (button) {
                                if (button.link2s && button.link2s.noselect) {
                                    return false;
                                }
                                const count = ui.selected.buttons.reduce((acc, button) => {
                                    const key = button.link2s.type2;
                                    acc[key] = (acc[key] || 0) + 1;
                                    return acc;
                                    }, {});
                                console.log('已选:',count);
                                if (ui.selected.buttons.length) {
                                    type1 = ui.selected.buttons[0].link2s.type2;
                                    if(type1=='skill') return false;  
                                    //选择了一个skill-node 其他均不可再选
                                    /*
                                    for(let i=0;i<ui.selected.buttons.length;i++){
                                        if(ui.selected.buttons[i].link2s.type2=='skill'){
                                            ui.selected.buttons[i].classList.add('unselectable');
                                        }
                                    } */
                                    // return ui.selected.buttons.length == 2;
                                    if(type1=='wujiang') {
                                        type2 = button.link2s.type2;
                                        if(type2=='skill') return false;  
                                        else if(ui.selected.buttons.length<2){
                                            return true;
                                        }
                                        return false;
                                    }
                                    //return false;
                                }
                                //if(count.wujiang && count.skill) return false;
                                //if(count.wujiang && button.link2s.type=='skill') return false;
                                //if(count.skill && button.link2s.type=='wujiang') return false;
                                if(ui.selected.buttons.length){
                                    console.log(button.link,button.link2s,ui.selected.buttons.length);
                                }
                                return true;    //第一次所有button都可以选
                            });
							
							"step 1";
                            for (let i = 0; i < result.links.length; i++) {
                                console.log(player, "->", result.links[i]);
                                game.log("->"+result.links[i]);
                                player.addSkill(result.links[i]);
                            }
                        },
                    },
                    sxj_chenglong: {
                        enable: "phaseUse",
                        unique: true,
                        async content(event, trigger, player) {
                            //player.awakenSkill(event.name);
                            //const cards = player.getExpansions("twciyin");
                            let list = [];
                            if (_status.characterlist) {
                                for (const name of _status.characterlist) {
                                    if (["shu", "qun"].includes(lib.character[name][1])) {
                                        list.push(name);
                                    }
                                }
                            } else if (_status.connectMode) {
                                list = get.charactersOL(name => !["shu", "qun"].includes(lib.character[name][1]));
                            } else {
                                list = get.gainableCharacters(info => ["shu", "qun"].includes(info[1]));
                            }
                            const players = game.players.concat(game.dead);
                            for (var i = 0; i < players.length; i++) {
                                list.remove(players[i].name);
                                list.remove(players[i].name1);
                                list.remove(players[i].name2);
                            }
                            const filter = skill => {
                                const translation = get.skillInfoTranslation(skill, player);
                                if (!translation) {
                                    return false;
                                }
                                const info = get.info(skill);
                                return info && !info.zhuSkill && !info.limited && !info.juexingji && !info.hiddenSkill && !info.charlotte && !info.dutySkill && ["【杀】", "【闪】"].some(str => get.plainText(translation).includes(str));
                            };
                            list = list.filter(name => (lib.character[name][3] || []).some(filter));
                            if (!list.length) {
                                return;
                            }
                            const skillList = {};
                            for (const name of list.randomGets(4)) {
                                skillList[name] = (lib.character[name][3] || []).filter(filter);
                            }
                            if (Object.keys(skillList).length) {
                                const next = player.chooseButton(3, ["成龙：获得其中至多3个技能", [Object.keys(skillList), "character"]], true, [1, 3]);
                                next.set("skillList", skillList);
                                next.set("processAI", function () {
                                    const map = get.event("skillList");
                                    return {
                                        links: Object.values(map).flat().randomGets(2),
                                        bool: true,
                                    };
                                });
                                next.set("filterButton", button => {
                                    //console.log('选择了:',ui.selected.buttons.map(value=>value.link));
                                    return true;
                                })
                                next.set("custom", {
                                    replace: {
                                        button(button) {    //button点击函数
                                            if (!_status.event.isMine()) {
                                                return;
                                            }
                                            if (button.classList.contains("selectable") == false) {
                                                return;
                                            }
                                            const dialog = get.event("dialog");
                                            const updateCaption = (dialog,list) => {
                                                //const caption1 = dialog.content.childNodes[0];
                                                //const caption1 = dialog.bar2;
                                                const caption1 = dialog;
                                                let siderNode = caption1.querySelector(".caption.siderNode");
                                                if (siderNode) {
                                                    while (siderNode.childElementCount > 0) {
                                                        siderNode.removeChild(siderNode.lastChild);
                                                    }
                                                } else {
                                                    siderNode = ui.create.div('.caption.siderNode', caption1);
                                                    siderNode.style.cssText = `
                                                        width: 40px;
                                                        height: calc(95%);
                                                        right: -40px;
                                                        background-color: gray;
                                                        color: white;
                                                        text-align: center;
                                                        line-height: 16px;
                                                        `;
                                                }
                                                for(let i = 0; i < list.length; i++){
                                                    let cap1 = ui.create.div('span', siderNode);
                                                    cap1.style.cssText = `
                                                        text-align: center;
                                                        `;
                                                    cap1.textContent = get.translation(list[i].link);
                                                }
                                                ui.update();
                                            };
                                            
                                            const nodes = Array.from(dialog.content.childNodes[1].childNodes);
                                            console.log('第1行的character',nodes);
                                            if (nodes.includes(button)) {   //点选武将时
                                                if (button.classList.contains("selected")) {
                                                    button.classList.remove("selected");
                                                    while (dialog.content.childElementCount > 2) {
                                                        dialog.content.removeChild(dialog.content.lastChild);
                                                    }
                                                    dialog.buttons.splice(nodes.length);
                                                    ui.update();
                                                } else {
                                                    const node = nodes.find(node => node.classList.contains("selected"));
                                                    if (node) {
                                                        node.classList.remove("selected");
                                                        while (dialog.content.childElementCount > 2) {
                                                            dialog.content.removeChild(dialog.content.lastChild);
                                                        }
                                                        dialog.buttons.splice(nodes.length);
                                                        ui.update();
                                                    }
                                                    button.classList.add("selected");
                                                    dialog.add([get.event("skillList")[button.link].map(value => [value, get.translation(value)]), "tdnodes"]);
                                                    dialog.buttons.forEach(function (button) {
                                                        if (ui.selected.buttons.some(value => value.link == button.link)) {
                                                            button.classList.add("selected");
                                                        }
                                                    });
                                                    game.check();
                                                }
                                            } else {    //点选第2行skill按钮时
                                                const caption1 = dialog.content.childNodes[0];
                                                if (button.classList.contains("selected")) {
                                                    ui.selected.buttons.remove(button);
                                                    button.classList.remove("selected");
                                                    console.log("当前已选择：",caption1,ui.selected.buttons.map(value=>value.link));
                                                    updateCaption(dialog,ui.selected.buttons);
                                                    
                                                    if (_status.multitarget || _status.event.complexSelect) {
                                                        game.uncheck();
                                                        game.check();
                                                    }
                                                } else {
                                                    button.classList.add("selected");
                                                    ui.selected.buttons.add(button);
                                                    console.log("当前已选择：",caption1,ui.selected.buttons.map(value=>value.link));
                                                    updateCaption(dialog,ui.selected.buttons);

                                                }
                                                const custom = get.event("custom");
                                                if (custom && custom.add && custom.add.button) {
                                                    custom.add.button();
                                                }
                                            }
                                            game.check();
                                            nodes.forEach(button => button.classList.add("selectable"));
                                        },
                                        window() {  //空白处点击函数
                                            const dialog = get.event("dialog");
                                            const node = dialog.content.childNodes[1];
                                            const selected = Array.from(node.childNodes).find(node => node.classList.contains("selected"));
                                            if (selected) {
                                                selected.classList.remove("selected");
                                                while (dialog.content.lastChild != node) {
                                                    dialog.content.removeChild(dialog.content.lastChild);
                                                }
                                                dialog.buttons.splice(node.childElementCount);
                                            }
                                            game.uncheck();
                                            game.check();
                                            const caption1 = dialog;
                                            let siderNode = caption1.querySelector(".caption.siderNode");
                                            if (siderNode) {
                                                while (siderNode.childElementCount > 0) {
                                                    siderNode.removeChild(siderNode.lastChild);
                                                }
                                            }
                                            ui.update();
                                        },
                                    },
                                    add: next.custom.add,//{} 必须添加
                                });
                                const links = await next.forResultLinks();
                                await player.addSkills(links);
                            }
                        },
                    },
                    sxj_freechar: { 
                        enable: "phaseUse",
                        unique: true,
                        async content(event, trigger, player) {
                            game.log(player, '发动了【DDD:1】【化身】');
                            player.popup('化身');
                            //==========================================================
                            var list_my = [];
                            for (var pack in lib.characterPack) {
                                //game.log(pack); //mode_extension_扩展1
                            }
                            for (var i in lib.characterPack['mode_extension_扩展1']) {
                                //game.log(i, ':', lib.character[i][3]);
                            }
                            for (var i in lib.characterPack['standard']) { //i==name???
                                //game.log(i, ':', lib.character[i][3]);
                                list_my.push(i);
                            }
                            //list_my.addArray(lib.xxxSkills);
                            let list = list_my;
                            //==========================================================
                            /*
                            var players = game.players.concat(game.dead);
                            for (var i = 0; i < players.length; i++) {
                            list.remove(players[i].name);
                            list.remove(players[i].name1);
                            list.remove(players[i].name2);
                            }*/
                            let dialog = ui.create.characterDialog("heightset");//
                            const next = player.chooseButton(dialog, [1, 4], false).set('ai', function (button) {
                                //player.sex  =lib.character[character][0];
                                //player.group=lib.character[character][1];   [3]=skills
                                if (lib.character[button.link][1] == 'shu')
                                    return 1 + Math.random();
                                return 0;
                            });
                            const updateCaption = (dialog,list) => {
                                //const caption1 = dialog.content.childNodes[0];
                                //const caption1 = dialog.bar2;
                                const caption1 = dialog;
                                let siderNode = caption1.querySelector(".caption.siderNode");
                                if (siderNode) {
                                    while (siderNode.childElementCount > 0) {
                                        siderNode.removeChild(siderNode.lastChild);
                                    }
                                } else {
                                    siderNode = ui.create.div('.caption.siderNode', caption1);
                                    siderNode.style.cssText = `
                                        width: 50px;
                                        height: calc(95%);
                                        right: -50px;
                                        background-color: gray;
                                        color: white;
                                        text-align: center;
                                        line-height: 10px;
                                        `;
                                }
                                for(let i = 0; i < list.length; i++){
                                    let cap1 = ui.create.div('span', siderNode);
                                    cap1.style.cssText = `
                                        text-align: center;
                                        font-size: 14px;
                                        `;
                                    cap1.textContent = get.translation(list[i].link);
                                }
                                ui.update();
                            };
                            updateCaption(dialog,ui.selected.buttons);
                            //next.set("prompt2","请选择化身武将");
                            next.set("custom", {
                                replace: {
                                    button(button) {    //button点击函数
                                        if (!_status.event.isMine()) {
                                            return;
                                        }
                                        if (button.classList.contains("selectable") == false) {
                                            return;
                                        }
                                        const dialog = get.event("dialog");
                                        const nodes = Array.from(dialog.content.childNodes[1].childNodes);
                                        console.log('第1行的character',nodes);
                                        //点选第2行skill按钮时
                                        const caption1 = dialog.content.childNodes[0];
                                        if (button.classList.contains("selected")) {
                                            ui.selected.buttons.remove(button);
                                            button.classList.remove("selected");
                                            console.log("当前已选择：",caption1,ui.selected.buttons.map(value=>value.link));
                                            updateCaption(dialog,ui.selected.buttons);
                                            /*
                                            if (_status.multitarget || _status.event.complexSelect) {
                                                game.uncheck();
                                                game.check();
                                            }*/
                                        } else {
                                            button.classList.add("selected");
                                            ui.selected.buttons.add(button);
                                            console.log("当前已选择：",caption1,ui.selected.buttons.map(value=>value.link));
                                            updateCaption(dialog,ui.selected.buttons);

                                        }
                                        const custom = get.event("custom");
                                        if (custom && custom.add && custom.add.button) {
                                            custom.add.button();
                                        }
                                        game.check();
                                        nodes.forEach(button => button.classList.add("selectable"));
                                    },
                                    window() {  //空白处点击函数
                                        const dialog = get.event("dialog");
                                        const node = dialog.content.childNodes[2];
                                        const selected = Array.from(node.childNodes).find(node => node.classList.contains("selected"));
                                        if (selected) {
                                            selected.classList.remove("selected");
                                        }
                                        game.uncheck();
                                        game.check();
                                        const caption1 = dialog;
                                        let siderNode = caption1.querySelector(".caption.siderNode");
                                        if (siderNode) {
                                            while (siderNode.childElementCount > 0) {
                                                siderNode.removeChild(siderNode.lastChild);
                                            }
                                        }
                                        ui.update();
                                    },
                                },
                                //add: next.custom.add,//{} 必须添加
                                add: {
                                    window(){
                                    }
                                },
                            });

                        }
                    },
                    sxj_wuwei: {
                        enable: "phaseUse",
                        unique: true,
                        async content(event, trigger, player) {
                            const next = player.chooseButton(["武威：请选择" + "次以下项", [["摸一张牌", "令目标角色本回合非锁定技失效", "令本回合〖武威〗可发动次数+1"].map((item, i) => [i, item]), "textbutton"]])
                            .set("forced", true)
                            .set("selectButton", [2, 4])
                            .set("filterButton", button => {
                                const selected = ui.selected.buttons.slice().map(i => i.link);
                                if (selected.length >= get.event().selectButton[1]) {
                                    return false;   //不可再点击
                                }
                                return true;
                            })
                            .set("custom", {
                                add: {
                                    confirm(bool) { //确认btn点击时
                                        console.log(bool,'a1-custom.add.confirm');
                                        if (bool != true) {
                                            return;
                                        }
                                        const event = get.event().parent;
                                        if (event.controls) {
                                            event.controls.forEach(i => i.close());
                                        }
                                        if (ui.confirm) {
                                            ui.confirm.close();
                                        }
                                        game.uncheck();
                                    },
                                    button() {
                                        console.log('a2-custom.add.button');
                                        if (ui.selected.buttons.length) {   //已选择
                                            return;
                                        }
                                        const event = get.event();  //未选择，全置空
                                        if (event.dialog && event.dialog.buttons) {
                                            for (let i = 0; i < event.dialog.buttons.length; i++) {
                                                const button = event.dialog.buttons[i];
                                                const counterNode = button.querySelector(".caption");
                                                if (counterNode) {
                                                    counterNode.childNodes[0].innerHTML = ``;
                                                }
                                            }
                                        }
                                        if (!ui.selected.buttons.length) {
                                            const evt = event.parent;
                                            if (evt.controls) {
                                                evt.controls[0].classList.add("disabled");
                                            }
                                        }
                                    },
                                },
                                replace: {
                                    button(button) {
                                        console.log('r2-custom.replace.button');
                                        const event = get.event();
                                        if (!event.isMine() || !event.filterButton(button)) {
                                            return;
                                        }
                                        if (button.classList.contains("selectable") == false) {
                                            return;
                                        }
                                        button.classList.add("selected");
                                        ui.selected.buttons.push(button);
                                        let counterNode = button.querySelector(".caption");
                                        const count = ui.selected.buttons.filter(i => i == button).length;
                                        if (counterNode) {
                                            counterNode = counterNode.childNodes[0];
                                            counterNode.innerHTML = `×${count}`;
                                        } else {
                                            counterNode = ui.create.caption(`<span style="font-family:xinwei; text-shadow:#FFF 0 0 4px, #FFF 0 0 4px, rgba(74,29,1,1) 0 0 3px;">×${count}</span>`, button);
                                        }
                                        /*
                                        const evt = event.parent;
                                        if (evt.controls) {
                                            evt.controls[0].classList.remove("disabled");
                                        }*/
                                        game.check();
                                    },
                                },
                            })

                        }
                    },
                    "test_refuhan": {  //参考
                        content: function () {
                            "step 0";
                            game.log('test_refuhan')
                            //player.awakenSkill("refuhan");
                            "step 1";
                            
                            if (player.isUnderControl()) {
                                game.swapPlayerAuto(player);
                            }
                            var switchToAuto = function () {
                                _status.imchoosing = false;
                                event._result = {
                                    bool: true,
                                    skills: skills.randomGets(2),
                                };
                                if (event.dialog) event.dialog.close();
                                if (event.control) event.control.close();
                            };
                            var chooseButton = function (list, skills) {
                                var event = _status.event;
                                if (!event._result) event._result = {};
                                event._result.skills = [];
                                var rSkill = event._result.skills;
                                var dialog = ui.create.dialog("XXXX", [list, "character"], "hidden");
                                event.dialog = dialog;
                                //
                                list = ['wusheng','paoxiao'];
                                list.sort();
                                list = list.map(current => [current, get.translation(current)]);
                                event.list = list;
                                dialog.add([list, "tdnodes"])

                                /*
                                var table = document.createElement("div");
                                table.classList.add("add-setting");
                                table.style.margin = "0";
                                table.style.width = "100%";
                                table.style.position = "relative";
                                for (var i = 0; i < skills.length; i++) {
                                    var td = ui.create.div(".shadowed.reduce_radius.pointerdiv.tdnode");
                                    td.link = skills[i];
                                    table.appendChild(td);
                                    td.innerHTML = "<span>" + get.translation(skills[i]) + "</span>";
                                    td.addEventListener(lib.config.touchscreen ? "touchend" : "click", function () {
                                        if (_status.dragged) return;
                                        if (_status.justdragged) return;
                                        _status.tempNoButton = true;
                                        setTimeout(function () {
                                            _status.tempNoButton = false;
                                        }, 500);
                                        var link = this.link;
                                        if (!this.classList.contains("bluebg")) {
                                            if (rSkill.length >= 2) return;
                                            rSkill.add(link);
                                            this.classList.add("bluebg");
                                        } else {
                                            this.classList.remove("bluebg");
                                            rSkill.remove(link);
                                        }
                                    });
                                }
                                dialog.content.appendChild(table);
                                */
                                dialog.add("　　");
                                dialog.open();
                
                                event.switchToAuto = function () {
                                    event.dialog.close();
                                    event.control.close();
                                    game.resume();
                                    _status.imchoosing = false;
                                };
                                event.control = ui.create.control("ok", function (link) {
                                    event.dialog.close();
                                    event.control.close();
                                    game.resume();
                                    _status.imchoosing = false;
                                });
                                for (var i = 0; i < event.dialog.buttons.length; i++) {
                                    event.dialog.buttons[i].classList.add("selectable");
                                }
                                game.pause();
                                game.countChoose();
                            };
                            if (event.isMine()) {
                                chooseButton(list, skills);
                            } else if (event.isOnline()) {
                                event.player.send(chooseButton, list, skills);
                                event.player.wait();
                                game.pause();
                            } else {
                                switchToAuto();
                            }
                            "step 2";
                            var map = event.result || result;
                            if (map && map.skills && map.skills.length) {
                                player.addSkills(map.skills);
                            }
                            game.broadcastAll(function (list) {
                                game.expandSkills(list);
                                for (var i of list) {
                                    var info = lib.skill[i];
                                    if (!info) continue;
                                    if (!info.audioname2) info.audioname2 = {};
                                    info.audioname2.zhaoxiang = "fuhan";
                                }
                            }, map.skills);
                            "step 3";
                            if (player.isMinHp()) player.recover();
                        },
                    },
                },
                translate: {
                    "sxj_jia2": "JIA2",
                    "sxj_jia2_info": "JIA2",
                    "sxj_xinfuhan": "FUHAN",
                    "sxj_xinfuhan_info": "choose CharacterSkill",
                },
            },
            intro: "",
            author: "LQZC",
            diskURL: "",
            forumURL: "",
            version: "1.0",
        }, files: { "character":[], "card": [], "skill": [], "audio": [] }
    }
});