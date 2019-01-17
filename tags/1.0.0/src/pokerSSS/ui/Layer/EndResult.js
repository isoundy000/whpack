/**
 * Created by atom on 2016/9/24.
 */
var SSSEndResult = cc.Layer.extend({
  root:null,
  panel_cell:null,
  listview_result:null,
  image_head_deinit: false,
  data:null,
    ctor: function (data) {
      this._super(data);
      this.data = SSSPoker.table.report;

      JJLog.print('End Result:' + JSON.stringify(this.data));

      this.root = ccs.load(SSSPokerJson.EndResult).node;
      this.addChild(this.root);
      var btn_back = ccui.helper.seekWidgetByName(this.root,"btn_back");
      btn_back.addClickEventListener(function () {
        SSSPoker.net.leavePrivateTable(1,function (data) {
          JJLog.print('End report leave table resp');
          var majHall = new MajhongHall();
          majHall.showHall();
        });
      });
      var btn_share = ccui.helper.seekWidgetByName(this.root,"btn_share");
      btn_share.addClickEventListener(function () {
          hall.net.wxShareScreen(0);
      });
      if(hall.songshen == 1)
      {
        btn_share.setVisible(false);
      }
      var text_room_id = ccui.helper.seekWidgetByName(this.root,"text_room_id");
      var text_room_info = ccui.helper.seekWidgetByName(this.root,"text_room_info");
      var text_room_time = ccui.helper.seekWidgetByName(this.root,"text_room_time");
      var text_forbidden = ccui.helper.seekWidgetByName(this.root,"text_forbidden");
      var text_version = ccui.helper.seekWidgetByName(this.root,"text_version");
      text_version.setString("Version: " + hall.curVersion);

      this.listview_result = ccui.helper.seekWidgetByName(this.root,"listview_result");

      this.panel_cell = ccui.helper.seekWidgetByName(this.root,"panel_cell");
      this.panel_cell.setVisible(false);

      text_room_id.setString('房号:'+SSSPoker.table.roomId);
      text_room_id.setVisible(true);


      text_room_info.setString('局数:'+SSSPoker.table.roundTotal);
      text_room_info.setVisible(true);

      var date = new Date();
      var timeStr = '';
      var month = date.getMonth();
      month += 1;
      timeStr += month < 10? '0'+month+'-':month+'-';
      var day = date.getDate();
      timeStr += day < 10? '0'+day+' ':day+' ';
      var hour = date.getHours();
      timeStr += hour < 10? '0'+hour+':':hour+':';
      var minute = date.getMinutes();
      timeStr += minute < 10? '0'+minute+':':minute+':';
      var sec = date.getSeconds();
      timeStr += sec < 10? '0'+sec :sec
      ;
      text_room_time.setString(timeStr);
      text_room_time.setVisible(true);


    },

    initList: function () {

      var data = this.data;
      JJLog.print(JSON.stringify(data));

      this.listview_result.removeAllChildren();
      var playerArray = data['players'];
      JJLog.print(playerArray.length);
      var playercount = playerArray.length;

      var winner_id = -1;
      var owner_id = -1;
      if(data['bigWiner'] != undefined) winner_id = data['bigWiner'];
      if(data['fangZhu'] != undefined) owner_id = data['fangZhu'];

      for(var i = 0; i < playerArray.length;i++)
      {
        var info = playerArray[i];
        var id = info['uid'];
        var cell = this.panel_cell.clone();
        var layout = new ccui.Layout();
        layout.setContentSize(cell.getContentSize());
        layout.addChild(cell);
        var text_name = ccui.helper.seekWidgetByName(cell,"text_name");
        var name = base64.decode(info['nickName']);
        var text_id =  ccui.helper.seekWidgetByName(cell,"text_id");
        if(name.length > 4)
        {
          name = name.slice(0,4);
          name += '..';
        }
        text_name.setString(name);
        text_id.setString('ID:'+ info['uid']);
        JJLog.print(info['nickName']);

        var sprite_head = ccui.helper.seekWidgetByName(cell,"sprite_head");
        if (info.headUrl != undefined && info.headUrl.length > 0) {
          if(info.headUrl.substring(info.headUrl.length-1,info.headUrl.length) == "0")
          {
            info.headUrl = info.headUrl.substring(0,info.headUrl.length-1)+"96";
          }
          // var tex = util.getTextureForKey(info.headUrl);
          // if (tex != null && tex != undefined) {
          //   var size = sprite_head.getContentSize();
          //   var sprite = new cc.Sprite(tex);
          //   var size_sp = sprite.getContentSize();
          //   sprite.setScaleX(size.width/size_sp.width);
          //   sprite.setScaleY(size.height/size_sp.height);
          //   sprite.setAnchorPoint(cc.p(0, 0));
          //   sprite_head.addChild(sprite);
          // }else {
          //     cc.loader.loadImg(info.headUrl,
          //        function (err, tex) {
          //          JJLog.print(err);
          //          if (err == null && !this.image_head_deinit) {
          //            var size = this.getContentSize();
          //            var sprite = new cc.Sprite(tex);
          //            var size_sp = sprite.getContentSize();
          //            sprite.setScaleX(size.width/size_sp.width);
          //            sprite.setScaleY(size.height/size_sp.height);
          //            sprite.setAnchorPoint(cc.p(0, 0));
          //            this.addChild(sprite);
          //          }
          //        }.bind(sprite_head));
          // }
            util.LoadHead(sprite_head , info.headUrl);
        }

        var text_score = ccui.helper.seekWidgetByName(cell,"text_score");
        text_score.setString(info['coinNum']);

        // if(info['coinNum'] < 0)
        // {
        //   var color = {r: 247, g: 7, b: 7};
        //   text_score.setColor(color);
        // }

        var image_winner = ccui.helper.seekWidgetByName(cell,"image_winner");
        image_winner.setVisible(false);
        var image_owner = ccui.helper.seekWidgetByName(cell,"image_owner");
        image_owner.setVisible(false);
        if(id == owner_id) image_owner.setVisible(true);
        if(id == winner_id) image_winner.setVisible(true);

        if(playercount==7)
        {
          layout.setContentSize(cc.size(cell.getContentSize().width*0.87,cell.getContentSize().height*0.87));
          cell.setScale(0.9);
        }else if(playercount==8)
        {
          layout.setContentSize(cc.size(cell.getContentSize().width*0.76,cell.getContentSize().height*0.76));
          cell.setScale(0.8);
        }

        if(playercount == 2)
        {
          cell.x = 200;
          this.listview_result.setItemsMargin(150);  //设置间隔
        }else if(playercount == 3)
        {
          cell.x = 150;
          this.listview_result.setItemsMargin(60);  //设置间隔
        }
        else if(playercount == 4)
        {
          cell.x = 80;
          this.listview_result.setItemsMargin(40);  //设置间隔
        }
        else if(playercount == 5)
        {
          cell.x = 40;
          this.listview_result.setItemsMargin(15);  //设置间隔
        }else
        {
          cell.x = 0;
        }

        cell.y = 0;
        cell.setVisible(true);
        if(id == owner_id)
        {
          this.listview_result.insertCustomItem(layout,0);
        }else
        {
          this.listview_result.pushBackCustomItem(layout);
        }


      }
      SSSPoker.table.report = {};
    },

    onEnter: function () {
      this._super();
      this.initList();
      sound.stopBgSound();
      sound.stopEffect();
    },

    onExit: function() {
      this._super();
      this.image_head_deinit = true;
    },

  showGameResult: function () {
    var scene = new cc.Scene();
    scene.addChild(this);
    if(cc.sys.isNative)
    {
      cc.director.replaceScene(scene);
    }else
    {
      cc.director.runScene(scene);
    }
  }
});
