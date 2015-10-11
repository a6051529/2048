var game2048 = {
    config: {
        up: 38,
        down: 40,
        left: 37,
        right: 39,
        colNum: 4,
        rowNum: 4,
        $wrap: $('body')
    },
    canCreate: true,
    score: 0,
    hisScore: localStorage.getItem('his_score') || 0,
    init: function(){
        var config = this.config,
            h = config.$wrap.height(),
            This = this;

        this.setResize(h);
        this.createBg();
        this.createRect();
        This.canCreate = true;
        this.createRect();
        this.recordScore(0);
        $('html').css('fontSize', (h / 820 * 100) + 'px');
        $('.restart').off('click').on('click', function(){
            This.restartGame();
        });
        config.$wrap.off('keypress').on('keypress', function (event) {
            This.move(event.keyCode);
            return false;
        });                
    },
    setResize: function(h){
        var ulW = h * 0.8 - 10,
            headerH = h * 0.2;

        this.liW = ulW / 4.1;
        this.liPadding = ulW / 82;
        $('header').width(ulW).height(headerH);
        $('.game-title').width(headerH).height(headerH);
        $('.game-score').width(ulW - headerH - 50);
        $('.score-wrap p').css('lineHeight', headerH * 0.28 + 'px');
        $('ul').width(ulW).height(ulW);

    },
    // 构造方块对象
    createRect: function(){
        var This = this,
            oUl = $('ul'),
            w = This.liW,
            p = This.liPadding,
            colNum = this.config.colNum,
            rowNum = this.config.rowNum,
            arr = this.arr,
            oLi = null,
            num = Math.random() < 0.9 ? 2 : 4,
            x = Math.floor( Math.random() * colNum ),
            y = Math.floor( Math.random() * rowNum ),
            l = x * w + p,
            t = y * w + p,
            canCreate = false;

        if (This.canCreate === false) {return false;}
        for (var i = 0; i < rowNum; i++) {
            for (var j = 0; j < colNum; j++) {
                if ($.isEmptyObject(arr[i][j])) {
                    canCreate = true;
                    break;
                }
            }
        }
        if (canCreate === false) {
            return false;
        }
        if (!$.isEmptyObject(arr[x][y])) {
            This.createRect();
        } else {
            oLi = $('<li class="li' + num + '"><span>' + num + '</span></li>');
            oLi.css({
                'left': l,
                'top': t
            });
            arr[x][y] = {x:x,y:y,num:num,li: oLi};
            oUl.append(oLi);
            setTimeout(function(){
                oLi.addClass('show');
                This.canCreate = true;
                if (This.checkIsLive(arr)) {
                    This.gameOver();
                    return  false;
                }
            },50);
        }
    },
    // 创建棋盘
    createBg: function(){
        var colNum = this.config.colNum,
            rowNum = this.config.rowNum,
            arr = [];

        for(var i = 0; i < rowNum; i++){
            if (!arr[i]) {arr[i] = [];}
            for (var j = 0; j < colNum; j++) {
                arr[i][j] = {};
            }
        }
        this.arr = arr;
    },
    // 行动
    move: function(keyCode){
        var down = this.config.down,
            up = this.config.up,
            left = this.config.left,
            right = this.config.right;

        switch (keyCode) {
            case down:
                this.removeArr('down');
                this.createRect();
                break;
            case up:
                this.removeArr('up');
                this.createRect();
                break;
            case left:
                this.removeArr('left');
                this.createRect();
                break;
            case right:
                this.removeArr('right');
                this.createRect();
                break;
        }
    },
    // 消除与合并
    removeArr: function(arrow){
        var This = this,
            colNum = this.config.colNum,
            rowNum = this.config.rowNum,
            arr1 = [],
            arr = this.arr;

        This.canCreate = false;
        switch (arrow) {
            case 'down':
                for (var i = 0;i < rowNum; i++) {
                    arr[i] = This.check(arr[i].reverse(),'top','y',true).reverse();
                }
                break;
            case 'up':
                for (var i = 0;i < rowNum; i++) {
                    arr[i] = This.check(arr[i],'top','y',false);
                }                       
                break;
            case 'left':
                arr = This.changeXY(arr);
                for (var i = 0;i < colNum; i++) {
                    arr[i] = This.check(arr[i],'left','x',false);
                }
                arr = This.changeXY(arr);
                This.arr = arr;
                break;
            case 'right':
                arr = This.changeXY(arr);
                for (var i = 0;i < colNum; i++) {
                    arr[i] = This.check(arr[i].reverse(),'left','x',true).reverse();
                }
                arr = This.changeXY(arr);
                This.arr = arr;
                break;
        }
    },
    // 检测可以合并的数组
    check: function(arr,arrow,z,reverse){
            var This = this,
                w = This.liW,
                p = This.liPadding,
                prev,
                next,
                len = arr.length,
                c = len - 1,
                css = {};

            for (var j = 0; j < len - 1; j++) {
                prev = arr[j];
                for (var k = j+1; k < len; k++) {
                    css = {};
                    next = arr[k];
                    if ($.isEmptyObject(next)) {
                        continue;

                    // 如果是一样的
                    } else if (prev.num === next.num) {
                        arr[k] = {};
                        prev.li.removeClass('li' + prev.num).addClass('li' + prev.num * 2);
                        prev.num += next.num;
                        css[arrow] = reverse ? (c - j) * w + p : j * w + p;
                        css.opacity = 0;
                        next.li.css(css);
                        prev.li.find('span').text(prev.num);
                        prev.li.addClass('a-bouncein');
                        This.recordScore(prev.num);
                        remove(prev,next);
                        This.canCreate = true;
                        break;
                    } else if (prev.num !== next.num && $.isEmptyObject(prev)) {
                        arr[j] = arr[k];
                        arr[k] = {};
                        arr[j][z] = reverse ? c - j : j;
                        css[arrow] = reverse ? (c - j) * w + p : j * w + p;
                        arr[j].li.css(css);
                        j--;
                        This.canCreate = true;
                        break;
                    } else {
                        if ($.isEmptyObject(arr[j+1])) {
                            arr[j+1] = arr[k];
                            arr[k] = {};
                            arr[j+1][z] = reverse ? (c - j - 1) : j+1;
                            css[arrow] = reverse ? ( c - j - 1 ) * w + p : (j+1) * w + p;
                            arr[j+1].li.css(css);
                            This.canCreate = true;
                        }
                        break;
                    }
                }
            }
            function remove(prev,next){
                setTimeout(function(){
                    prev.li.removeClass('a-bouncein');
                    next.li.remove();
                },300);
            }
            return arr;
        },
    // 转换数组
    changeXY: function(arr){
        var cloneArr = [],
            tmp;

        for (var i = 0;i < arr.length; i++) {
            for (var j = 0; j < arr[i].length; j++) {
                if (!cloneArr[j]) {
                    cloneArr[j] = [];
                }
                cloneArr[j][i] = $.extend({},arr[i][j]);
            }
        }
        return cloneArr;
    },
    checkIsLive: function(arr){
        var prev,
            next;

        function foreach(arr){
            for (var i = 0;i < arr.length; i++) {
                for (var j = 0; j < arr[i].length - 1; j++) {
                    prev = arr[i][j];
                    next = arr[i][j+1];
                    if ($.isEmptyObject(prev) || $.isEmptyObject(next) || prev.num === next.num) {
                        return false;
                    } else {
                        continue;
                    }
                }
            }
            return true;
        }

        return foreach(arr) && foreach(this.changeXY(arr));

    },
    recordScore: function(num){
        this.score += num;
        this.hisScore = this.hisScore >= this.score ? this.hisScore : this.score;

        $('.this-score h3').text(this.score);
        $('.history-score h3').text(this.hisScore);
        localStorage.setItem('his_score',this.hisScore);
    },
    restartGame: function(){
        this.arr = [];
        $('ul li').remove();
        this.score = 0;
        this.recordScore(0);
        this.init();
    },
    gameOver: function(){
        alert('挂掉啦');
    }
};