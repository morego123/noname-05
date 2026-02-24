// @ts-ignore
test_xinbenxi: {
    enable: "phaseUse",
    unique: true,
    content: function () {
        "step 0";
        var list;
        if (_status.characterlist) {
            list = [];
            for (var i = 0; i < _status.characterlist.length; i++) {
                var name = _status.characterlist[i];
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
        var players = game.players.concat(game.dead);
        for (var i = 0; i < players.length; i++) {
            list.remove(players[i].name);
            list.remove(players[i].name1);
            list.remove(players[i].name2);
        }
        list.remove("zhaoyun");
        list.remove("re_zhaoyun");
        list.remove("ol_zhaoyun");
        list = list.randomGets(Math.max(4, game.countPlayer()));
        //list = ['liubei','guanyu','huangyueying','baosanniang'];
        var skills = [];
        var scnt=0;
        var scnt_max=0;
        for (var i of list) {
            var skillOfi = (lib.character[i][3] || []).filter(function (skill) {
                var info = get.info(skill);
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
        var list1 = [];
        var buttonsList = [];
        function create2DArray(rows, cols) {
            return Array.from({ length: rows }, () => Array(cols).fill(0)); 
            // 初始值为 0，可以根据需要修改
        }
        var grids = create2DArray(scnt_max, list.length);
        for (let i = 0; i < list.length; i++) {
            list1[i] = [list[i], 0, {noselect:true,link2:1234,nowidth:true}];
            //if(i==2) list1[i][2].noselect = false;
            for(let ii = 0; ii < skills[i].length; ii++){   //第ii行
                grids[ii][i] = skills[i][ii];
            }
        }
        //game.log_zc2('@@@@@');
        //game.log_zc2(get.translation(player)+'!!!!!'+get.translation('test_xinbenxi'));
        game.log('Grid:',grids);
        game.log(scnt_max);    //'1fr 1fr 1fr 1fr'
        game.log(list.length); //Array(list.length).fill('1fr').join(' ')
        var css1 = {
            display : 'grid',
            gridTemplateColumns : Array(list.length).fill('1fr').join(' '),
            //alignContent : 'center',
            justifyContent: 'center'
        };
        buttonsList.add('REHUHNA');
        buttonsList.add([list1,"character",{css2:css1}]);
        //scnt_max 行
        for (let i = 0; i < scnt_max; i++) {
            //game.log(i);
            let skills_row = grids[i];
            //game.log('::::::::::',skills_row);
            var list2 = skills_row.map(function(current) {
                //game.log(':item:',current);
                if(current == 0) return [current, '0', {noselect:false,link2:null,isBlank:true}];
                else return [current, get.translation(current)];
            });
            //console.log('::::::::::',list2);
            //game.log('::::::::::',list2);
            buttonsList.add([list2,"tdnodes",{css2:css1}]);
        }
        //////
        var next = player.chooseButton( buttonsList );
        next.set("forced", true);
        next.set("selectButton", [1, 4]);
        next.set("filterButton", function (button) {
            //return true;
            console.log(button.link,button.link2s);
            if (button.link2s && button.link2s.noselect) {
                return false;
            }
            return true;
        });
        "step 1";
        for (var i = 0; i < result.links.length; i++) {
            console.log(player, "...", result.links[i]);
            game.log_zc2("..."+result.links[i]);
            //map[result.links[i]](trigger, player, event);
        }
    },
},
refuhan: {
    filter: true,
    content: function () {
        "step 0";
        if (player.storage.fanghun) player.draw(player.storage.fanghun);
        "step 1";
        var list;
        if (_status.characterlist) {
            list = [];
            for (var i = 0; i < _status.characterlist.length; i++) {
                var name = _status.characterlist[i];
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
        var players = game.players.concat(game.dead);
        for (var i = 0; i < players.length; i++) {
            list.remove(players[i].name);
            list.remove(players[i].name1);
            list.remove(players[i].name2);
        }
        list.remove("zhaoyun");
        list.remove("re_zhaoyun");
        list.remove("ol_zhaoyun");
        list = list.randomGets(Math.max(4, game.countPlayer()));
        //list   =[]
        //skills =[]
        var skills = [];
        for (var i of list) {
            skills.addArray(
                (lib.character[i][3] || []).filter(function (skill) {
                    var info = get.info(skill);
                    return info && !info.zhuSkill && !info.limited && !info.juexingji && !info.hiddenSkill && !info.charlotte && !info.dutySkill;
                })
            );
        }
        if (!list.length || !skills.length) {
            event.finish();
            return;
        }
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
            var dialog = ui.create.dialog("1~2", [list, "character"], "hidden");
            event.dialog = dialog;
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
    }
},
get={
fuhan:{
    characters:function () {
        return [1,2,3]
    }
}

}


dcchushan: {
    async content(event, trigger, player) {
        if (!_status.characterlist) lib.skill.pingjian.initList();
        _status.characterlist.randomSort();
        const characters = _status.characterlist.randomGets(6);
        const first = characters.slice(0, 3),
            last = characters.slice(3, 6);
        const skills1 = [],
            skills2 = [];
        for (let i of first) skills1.push(get.character(i, 3).randomGet());
        for (let i of last) skills2.push(get.character(i, 3).randomGet());
        const result1 = await player
            .chooseControl(skills1)
            .set("dialog", ["xxx", [first, "character"]])
            .forResult();
        const gains = [];
        let surname = first[skills1.indexOf(result1.control)];
        gains.add(result1.control);
        const result2 = await player
            .chooseControl(skills2)
            .set("dialog", ["xxxx", [last, "character"]])
            .forResult();
        let name = last[skills2.indexOf(result2.control)];
        gains.add(result2.control);
        let newname = get.characterSurname(surname).randomGet()[0] + get.characterSurname(name).randomGet()[1];
        if (newname === "xxxx") {
            newname = "xxx";
            player.chat("xxxx...");
        }
        game.broadcastAll(
            (player, name, list) => {
                if (player.name == "dc_noname" || player.name1 == "dc_noname") player.node.name.innerHTML = name;
                if (player.name2 == "dc_noname") player.node.name2.innerHTML = name;
                player.tempname.addArray(
                    list.map(name => {
                        while (get.character(name).tempname.length > 0) {
                            name = get.character(name).tempname[0];
                        }
                        return name;
                    })
                );
            },
            player,
            newname,
            [surname, name]
        );
        await player.addSkills(gains);
    },
},