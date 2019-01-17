/**
 * Created by atom on 2016/9/11.
 */
var WHMJSelfSeat = WHMJDeskSeat.extend({
  panel_cardInTouch: null,
  panel_control: null,
  panel_guo: null,
  btn_guo: null,
  panel_controlCell: null,
  gangMode: 0,
  gap_panel: 0,
  gap_cardStand: 0,
  delCard: null,
  qihu_tip:false,//弃胡提示
  btn_test: null,
  isAction:false,
  opArray:null,
  outArray:null,
  testNum: 1,
  isdahu:0,
  image_huTips:null,
  huDate:null,
  chiGray: false,
  checkbox_bupai:null,
  panel_bupai:null,

  ctor: function (data) {
    this._super(data, 'selfseat');
    this.root = ccs.load("res/MajhongWH/WuHanPlayerPanel.json").node;
    this.addChild(this.root);
    this.opArray = new Array();
    this.outArray = new Array();
    this.gap_stand = 72;
    this.deskType = DeskType.Player;
    this.schedule(this.updateTime,0.5);
    this.moCardGap = 18;
  },
  
  updateTime: function (dt) {
        if(!this.isAction && this.opArray.length >0)
        {
          var data = this.opArray.shift();
          this.showControlPanel(data);
        }

        if(!this.isAction && this.outArray.length >0)
        {
          JJLog.print('自动打牌');
          var data = this.outArray.shift();
          if(this.gangMode > 1)
          {
            this.autoPutOutCard();
          }else
          {
            this.setCardInTouchEnable(true);
          }
        }

  },

  onEnter: function () {
    this._super();
    this.initSelfUI();
    if (MajhongInfo.GameMode == GameMode.PLAY) {
      this.registerSelfEvent();
      this.checkOffline();
    } else if (MajhongInfo.GameMode == GameMode.RECORD) {

    }

  },

  onExit: function () {
    this.moCard = null;
    this.removeSelfEvent();
    this._super();
  },

  registerSelfEvent: function () {
    qp.event.listen(this, 'mjPlayerMoCards', this.onMoCard.bind(this));
    qp.event.listen(this, 'mjNotifyPlayerOP', this.onNotifyPlayerOP.bind(this));
    qp.event.listen(this, 'mjNotifyDaHu', this.onNotifyDaHu);
    qp.event.listen(this, 'mjNotifyTingChoice', this.onNotifyTingChoice.bind(this));
        //********quanzhou*********
        var ls = cc.EventListener.create({
          event: cc.EventListener.CUSTOM,
          eventName: CommonEventAction.BUHUA_EVT,
          callback: this.removeHuaPaiCards.bind(this)
        });
        cc.eventManager.addListener(ls,this);

        var ls2 = cc.EventListener.create({
          event: cc.EventListener.CUSTOM,
          eventName: CommonEventAction.KAIJIN_EVT,
          callback: this.kaijinEvent.bind(this)
        });
        cc.eventManager.addListener(ls2,this);

        var ls3 = cc.EventListener.create({
          event: cc.EventListener.CUSTOM,
          eventName: CommonEventAction.PLAYEROP_EVT,
          callback: this.opEvent.bind(this)
        });
        cc.eventManager.addListener(ls3,this);

    var ls4 = cc.EventListener.create({
      event: cc.EventListener.CUSTOM,
      eventName: CommonEvent.TipEvent,
      callback: this.huTipEvent.bind(this)
    });
    cc.eventManager.addListener(ls4,this);

    var ls5 = cc.EventListener.create({
      event: cc.EventListener.CUSTOM,
      eventName: CommonEventAction.KAIPIZI_EVT,
      callback: this.kaipiziEvent.bind(this)
    });
    cc.eventManager.addListener(ls5,this);
        //---------quanzhou-----------
  },

  removeSelfEvent: function () {
    qp.event.stop(this, 'mjPlayerMoCards');
    qp.event.stop(this, 'mjNotifyPlayerOP');
    qp.event.stop(this, 'mjNotifyDaHu');
    qp.event.stop(this, 'mjNotifyTingChoice');

  },

  onNotifyDaHu:function (data) {
    // data.huType 1游金 2双游 3 三游 4三金倒  data.uid
    var huType = data['huType'];
    var uid = data['uid'];
    if(uid == this.uid && huType < 4)
    {
      this.isdahu = huType;
    }
  },

  onNotifyTingChoice:function (data) {

  //  {"uid":100003,"tingChoice":[{"del":{"type":"T","value":6},"hu":[],"num":[],"jin":1}]}#################2
    if (this.moCard != null) {
        this.cardInArray.push(this.moCard);
        this.moCard = null;
    }
    console.log("asfasd:%j",this.cardInArray);
    this.huDate = data['tingChoice'];
    for (var i = 0; i < this.cardInArray.length; i++) {
      var card = this.cardInArray[i];
      var isGray = true;
      for (var j = 0;j<this.huDate.length;j++) {
        var tingDate = this.huDate[j];
        var del = tingDate['del'];
        if(!!del && del.type + del.value == card.paiOfCard().keyOfPai())
        {
          isGray = false;
        }
      }
      if(isGray)
      {
        //card.showGray();
      }else
      {
        card.showTingTip();
      }
    }
  },
  //当点击桌面牌时的回调函数
    huTipEvent:function(event) {
        if(!! this.huDate)
        {   //JJLog.print("提示"+JSON.stringify(this.huDate));
            var key = event.getUserData();
            this.image_huTips.removeAllChildren();
            var showTip = false;
            for(var i = 0;i<this.huDate.length;i++)
            {
                if(!!this.huDate[i]['del'] && key == this.huDate[i]['del'].type + this.huDate[i]['del'].value)
                {
                      var huCards = this.huDate[i]['hu'];
                      var nums  = this.huDate[i]['num'];
                      this.image_huTips.setContentSize(cc.size(110+100*(huCards.length-1),145));
                      for(var j=0;j<huCards.length;j++)
                      {
                        var card = new WHMyCard(this, huCards[j],true);
                        this.image_huTips.addChild(card);
                        if(!!nums[j] || nums[j] == 0)
                        {
                          card.setCardCount(nums[j]);
                          if(nums[j] == 0)
                          {
                            card.showGray();
                          }
                        }
                        card.y = 0;
                        card.x = 13.5+ 100*j;
                      }
                      showTip = true;

                  //{"uid":100003,"tingChoice":[{"del":{"type":"T","value":6},"hu":[],"num":[],"jin":1}]}

                    break;
                }
            }
            this.image_huTips.setVisible(showTip);
        }
    },

  initSelfUI: function () {
    this.panel_cardInTouch = ccui.helper.seekWidgetByName(this.root, "panel_cardInTouch");
    //控制面板
    this.panel_control = ccui.helper.seekWidgetByName(this.root, "panel_control");
    this.panel_guo = ccui.helper.seekWidgetByName(this.panel_control, "panel_guo");
    this.btn_guo = ccui.helper.seekWidgetByName(this.panel_control, "btn_guo");
    this.panel_guo.setTag(101);
    this.btn_guo.addClickEventListener(this.onGuo.bind(this));
    this.panel_control.setVisible(false);
    this.panel_controlCell = ccui.helper.seekWidgetByName(this.panel_control, "panel_cell");
    this.panel_controlCell.setVisible(false);
    this.panel_controlCell.setTag(102);
    var panel_sub = ccui.helper.seekWidgetByName(this.panel_controlCell, "panel_sub");
    panel_sub.setVisible(false);

    var btn_chi = ccui.helper.seekWidgetByName(this.panel_control, "btn_chi");
    btn_chi.setTag(OPERATIONTYPE.CHI);
    btn_chi.setVisible(false);
    var btn_peng = ccui.helper.seekWidgetByName(this.panel_controlCell, "btn_peng");
    btn_peng.setTag(OPERATIONTYPE.PENG);
    btn_peng.setVisible(false);
    var btn_gang = ccui.helper.seekWidgetByName(this.panel_controlCell, "btn_gang");
    btn_gang.setVisible(false);
    btn_gang.setTag(OPERATIONTYPE.GANG);
    var btn_buzhang = ccui.helper.seekWidgetByName(this.panel_controlCell, "btn_buzhang");
    btn_buzhang.setVisible(false);
    btn_buzhang.setTag(OPERATIONTYPE.BUZHANG);
    var btn_ting = ccui.helper.seekWidgetByName(this.panel_controlCell, "btn_ting");
    btn_ting.setVisible(false);
    btn_ting.setTag(OPERATIONTYPE.TING);

    this.image_huTips = ccui.helper.seekWidgetByName(this.root, "image_tips");
    this.image_huTips.setVisible(false);

    this.btn_test = ccui.helper.seekWidgetByName(this.root, "btn_test");
    // this.btn_test.addClickEventListener(function () {
    //   this.playHuAniamtion(this.testNum++, 1);
    //   if (this.testNum > 13) {
    //     this.testNum = 1;
    //   }
    // }.bind(this));
    this.btn_test.setVisible(false);

    this.checkbox_bupai = ccui.helper.seekWidgetByName(this.root, "checkbox_bupai");
    this.checkbox_bupai.setTouchEnabled(false);
    this.checkbox_bupai.setSelected(this.isbubai == 1);

    this.panel_bupai = ccui.helper.seekWidgetByName(this.root, "panel_bupai");
    this.panel_bupai.setTouchEnabled(true);
    this.panel_bupai._checkBox = this.checkbox_bupai;
    this.panel_bupai.addClickEventListener(this.onClickBupai.bind(this));
  },

  onClickBupai:function (sender) {
    var _this = this;
    var op = (_this.isbubai==1?0:1);
    whmajhong.net.updateGdGangOp(op,function(data){
      JJLog.print('切换补牌回调 ='+JSON.stringify(data));
      if(data["code"] == 200)
      {
        _this.isbubai= op ;
        sender._checkBox.setSelected(_this.isbubai == 1);
      }
    });

  },

  setCardInTouchEnable: function (enable) {
    this.panel_cardInTouch.setVisible(!enable);
  },

  readyTing:function (data) {
    this.gangMode = 1;
    if (this.moCard != null) {
      this.cardInArray.push(this.moCard);
      this.moCard = null;
    }
    this.huDate = data;
    for (var i = 0; i < this.cardInArray.length; i++) {
      var card = this.cardInArray[i];
      var isGray = true;
      for (var j = 0;j<data.length;j++) {
        var tingDate = data[j];
        var del = tingDate['del'];
        if(!!del && del.type + del.value == card.paiOfCard().keyOfPai())
        {
          isGray = false;
        }
      }
      if(isGray)
      {
        card.showGray();
      }
    }
    if (this.moCard != null) {
      this.cardInArray.push(this.moCard);
      this.moCard = null;
    }
  },

  onSyncPlayerMocards: function (data) {
    JJLog.print('self onSyncPlayerMocards');
  },

  onSyncPlayerTianHu: function (data) {
    JJLog.print('ontianhu');
    JJLog.print(JSON.stringify(data));

    var dt = 0;
    if (this.uid == data['uid']) {
      var cards = data['msg']['cards'];
      for (var i = 0; i < cards.length; i++) {
        var pais = cards[i]['pais'];
        var type = cards[i]['type'];
        var len = pais.length;
        var w = 53;
        var paisWidth = len * 53;

        var panel = this.panel_tianhu.clone();
        panel.setVisible(false);

        var panel_card = ccui.helper.seekWidgetByName(panel, "panel_card");
        panel_card.setCascadeOpacityEnabled(true);
        var panel_image = ccui.helper.seekWidgetByName(panel, "panel_image");
        var image_word1 = ccui.helper.seekWidgetByName(panel, "image_word");
        image_word1.setVisible(false);
        var image_word = new cc.Sprite('#' + DaHuRes[type]);
        image_word.setPosition(image_word1.getPosition());
        image_word1.getParent().addChild(image_word);
        panel.setPosition(this.panel_tianhu.getPosition());
        this.panel_root.addChild(panel);

        var panelWidth = panel_card.getContentSize().width;
        var startPos = (panelWidth - paisWidth) / 2;
        for (var j = 0; j < pais.length; j++) {
          var card = new WHCardShowUp(pais[j]);
          card.x = startPos + w * j;
          card.y = 0;
          panel_card.addChild(card, j);
        }
        image_word.setScale(2.0);
        var soundData = {};
        soundData['sexType'] = this.sexType;
        soundData['huType'] = type;
        image_word.runAction(cc.sequence(cc.delayTime(dt),
          cc.show(),
          cc.callFunc(this.playTianhuSound.bind(soundData)),
          cc.scaleTo(0.1, 1.0), cc.scaleTo(0.05, 1.2)
          , cc.scaleTo(0.05, 1.0), cc.scaleTo(0.1, 1.1), cc.scaleTo(0.05, 1.0)
          , cc.delayTime(0.5), cc.fadeOut(0.2)
        ));
        panel_card.runAction(cc.sequence(cc.delayTime(dt),
          cc.show(), cc.fadeIn(0.35), cc.delayTime(2)
          , cc.fadeOut(0.3)));
        panel.runAction(cc.sequence(cc.delayTime(dt), cc.show(), cc.delayTime(2.6), cc.removeSelf()));
        dt += 3;
      }
    }
  },

  setHandCards: function (data) {
    var index = 0;
    this.panel_cardIn.removeAllChildren();
    for (var p in data) {
      var card = new WHMyCard(this, data[p]);
      var size = card.getContentSize();
      if (index == MajhongInfo.MajhongNumber - 1) {
        card.setPosition(size.width * index - this.gap_cardStand * index + this.moCardGap, 0);
        this.moCard = card;
      } else {
        card.setPosition(size.width * index - this.gap_cardStand * index, 0);
        this.cardInArray.push(card);
      }
      this.panel_cardIn.addChild(card);
      index++;
    }

    this.cardInArray = this.cardInArray.sort(this.sortCardList);

    for (var i = 0; i < this.cardInArray.length; i++) {
      this.cardInArray[i].setPosition(this.getIndexPosX(this.cardInArray[i], i), 0);
    }
  },

  getIndexPosX: function (card, index) {
    var size = card.getContentSize();
    return size.width * index - this.gap_cardStand * index;

  },

  onNotifyDelCards: function (data) {
    JJLog.print("onNotifyDelCards uid :" + JSON.stringify(data));
    if (data['uid'] != this.uid) return;
    this.outArray.push("true");
 //   this.setCardInTouchEnable(true);
    //吃牌的时候有几张牌不能打
    if(data['noDel'] != undefined && data['noDel'] != null && this.gangMode < 1 )
    {
      this.chiGray = true;
      var cardArry = data['noDel'];
      for (var i = 0; i < this.cardInArray.length; i++)
      {
        var card = this.cardInArray[i];
        var key = card.paiOfCard().keyOfPai();
        for(var j = 0; j < cardArry.length; j++)
        {
          if(cardArry[j]['type']+cardArry[j]['value'] == key)
          {
            card.showGray();
          }
        }
      }
    }
  },

  onMoCard: function (data) {
    JJLog.print("onMoCard");
    this.addMoCard(data);
  },

  onNotifyPlayerOP: function (data) {
    JJLog.print("onNotifyPlayerOP");
    if (data["uid"] != hall.user.uid) return;
    JJLog.print(JSON.stringify(data));
    this.opArray.push(data);
    //this.showControlPanel(data);
  },

  synPlayerOp: function (data) {
    this._super(data);
    this.dismissControlPanel();
  },

  onSyncDelCards: function (data) {
    JJLog.print('sync self del card');
  },

  initLastCards: function () {
    this._super();
    if (this.uid == whmajhong.table.offLineInfo['nextChuPai']) {
      var data = {'uid': this.uid};
      this.onNotifyDelCards(data);
    }
    var info = whmajhong.table.getCardByPlayer(this.uid);
    this.gangMode = info['isTing'];

    if (whmajhong.table.offLineInfo != null && whmajhong.table.offLineInfo['currOp']['isOp'] != 0) {
      this.showControlPanel(whmajhong.table.offLineInfo['currOp']);
    }
    //吃牌的时候有几张牌不能打
    if(info['noDel'] != undefined && info['noDel'] != null && this.gangMode < 1 )
    {
      this.chiGray = true;
      var cardArry = info['noDel'];
      for (var i = 0; i < this.cardInArray.length; i++)
      {
        var card = this.cardInArray[i];
        var key = card.paiOfCard().keyOfPai();
        for(var j = 0; j < cardArry.length; j++)
        {
          if(cardArry[j]['type']+cardArry[j]['value'] == key)
          {
            card.showGray();
          }
        }
      }
    }
    JJLog.print('是否听==='+ JSON.stringify(info));
    if(this.gangMode == 1)
    {
      this.readyTing(info['tingChoice']);
    }

    if(info['paiLast'] != undefined && info['paiLast'] != null)
    {
      var lastCard = info['paiLast'];
      for (var i = 0; i < this.cardInArray.length; i++) {
        var card = this.cardInArray[i];
        var key = card.paiOfCard().keyOfPai();
        var keyLast = lastCard['type'] + lastCard['value'];
        if (key == keyLast) {

          this.cardInArray.splice(i, 1);
          this.resetPanelInChild();

          this.moCard = card;
          var xx = this.posXOfPanel() + this.moCardGap;
          this.moCard.setPosition(xx, 0);
          break;
        }
      }
    }


    if(this.gangMode >1 )
    {
      this.postGangMode();
      this.setCardInTouchEnable(false);
    }
  },


  addCardIn: function (cardObj) {
    var card = new WHMyCard(this, cardObj);
    if(whmajhong.table.JinPaiId == card.paiOfCard().keyOfPai()){
      card.setJin();
    }
    if (whmajhong.table.PiziId1 == card.paiOfCard().keyOfPai() || whmajhong.table.PiziId2 == card.paiOfCard().keyOfPai() || whmajhong.table.PiziId3 == card.paiOfCard().keyOfPai())
    {
      card.setPi();
    }
    this.cardInArray.push(card);
    this.panel_cardIn.addChild(card);
  },

  addCardOut: function (cardObj) {

    var length = this.cardOutArray.length;
    var index = length%WHCommonParam.DeskOneNum;
    var floor = Math.floor(length/WHCommonParam.DeskOneNum);
    var card = new WHCardDownDesk(cardObj,index);
    if(floor == 0 || floor == 2)
    {
      card.setScaleX(0.91);
      card.setScaleY(0.93);
      card.y = 0;
      var off =0;
      if (floor == 2)
      {
        card.y = 18;
        off = 2;
        floor = 0;
      }
      var offx = card.getContentSize().width*0.9*WHCommonParam.DownCardGap*index-3;
      if(index > 4) offx -= 2*WHCommonParam.DownCardGap;
      card.x = offx-floor*card.getContentSize().width*0.08 - off;
    }else
    {
      card.setScaleX(0.99);
      card.y = -50;
      var offx = card.getContentSize().width*card.getScaleX()*WHCommonParam.DownCardGap*index-3-7*floor-2.7*floor*WHCommonParam.DownCardGap*index;
      if(index > 4) offx -= 2*WHCommonParam.DownCardGap;
      card.x = offx-floor*card.getContentSize().width*0.08;
    }
    var order = [4,5,6,7,8,9,3,2,1,0];
    var ting = cardObj['ting'];
    if(ting != undefined && ting != null)
    {
      if(ting == 1)
      {
        card.showBlue();
      }
    }
    this.panel_cardOut.addChild(card,order[index]+floor*10);
    this.cardOutArray.push(card);
    return card;
  },

  addGangCards: function (data) {
    this._super();
    var cards = data['msg']['cards'];
    for (var i = 0; i < cards.length; i++) {
      var key = cards[i];
      var outCard = new WHCardShowUp(key,CARD_SITE.HAND_GANG);
      var pos = this.posIndexOfOutCard();
      outCard.setPosition(pos);
      outCard.setScale(WHCommonParam.PutOutScaleBack);
      var num = this.cardOutArray.length;
      this.panel_cardOut.addChild(outCard, 20 - num);
      this.cardOutArray.push(outCard);
      outCard.showYellow();
    }

    this.gangMode = true;
    this.postGangMode();
  },
  postGangMode: function () {
    var event = new cc.EventCustom(CommonEvent.EVT_DESK_MODE);
    event.setUserData(CommonEventAction.GANG_EVT);
    cc.eventManager.dispatchEvent(event);
  },

  addMoCard: function (data) { // {type:"W",value:2}
    var card = new WHMyCard(this, data);
    if (this.moCard != null) {
      this.cardInArray.push(this.moCard);
      this.moCard = null;
      this.resetPanelInChild();
    }

    var xx = this.posXOfPanel() + this.moCardGap;
    card.setPosition(xx, 0);
    this.moCard = card;
    this.moCard.playEnterInAnimation();
    this.panel_cardIn.addChild(card);
  },

  putOutCardStart:function(card){
    var _this = this;
    this.setCardInTouchEnable(false);
    var data = card.paiOfCard().objectOfPai();
    var _pai = card.paiOfCard().keyOfPai();
    if(card.getCardJin() == 1)
    {
      this.putOutCardEnd(card);
      this.postOutCard(data);
      this.resetPanelInChild();
    }else
    {
      var soundData = {};
      soundData['cardType'] =_pai;
      soundData['userSex'] = this.sexType;
      sound.playCard(soundData);
      this.putOutCardAnimation(card);
      this.postOutCard(data);
    }

  },

  postOutCard: function (data2) {
    if (MajhongInfo.GameMode == GameMode.PLAY) {
      whmajhong.net.updatePlayerDelCard(data2, function (data) {
        if (data["code"] == 200) {

          if(this.chiGray == true) //打牌以后切换成能打状态
          {
            for(var i=0; i < this.cardInArray.length; i++ )
            {
              this.cardInArray[i].showWhite();
            }

            this.chiGray = false;
          }
          var cardCount = this.getCardCount();
          if(cardCount != 13)
          {
            this.forceDisconnect();
          }
        }else
        {
          this.forceDisconnect();
        }
        JJLog.print("put out card resp");
        JJLog.print(JSON.stringify(data));
      }.bind(this));
    } else if (MajhongInfo.GameMode == GameMode.RECORD) {

    }

  },

  posIndexOfOutCard: function () {
    //********quanzhou*********
    var num = this.cardOutArray.length;
    var width = 0;
    var height = 0;
    var a = [0,46,91,139,184,229];
    if(num > 0)
    {
      var card = this.cardOutArray[0];
      //46 91 137 184 230
      width = card.getContentSize().width*card.getScale()*WHCommonParam.DownCardGap; // 500  546  591 637  684  730
      height = card.getContentSize().height*card.getScale()*WHCommonParam.DownCardHeightGap;
    }

    if(MajhongInfo.MajhongNumber > 14)
    {
      var index = num%WHCommonParam.DeskOneNum;
      var floor = Math.floor(num/WHCommonParam.DeskOneNum);
      return cc.p(index*width-15,height*floor-10); //3 - 1.25*i
    }else
    {
      var index = num%WHCommonParam.DeskOneNum;
      var floor = Math.floor(num/WHCommonParam.DeskOneNum);
      return cc.p(a[index],-height*floor);
    }
    //---------quanzhou-----------
  },


  removePutOutCard: function (data) {


  },

  putOutCardAnimation: function (card) {
    var pai = card.paiOfCard().keyOfPai();
    var newOutCard = this.addCardOut(pai);
    newOutCard.setVisible(false);
    if(this.gangMode == 1 )
    {
      newOutCard.showBlue();
    }
    var outCard = new WHMyCard(this,pai,true);
    outCard.setScale(1.1);
    var pos = card.posOfPanel();
    var outPos = this.panel_cardOut.convertToNodeSpace(pos);
    outCard.setPosition(this.posCenterCardOut);
    outCard.setVisible(true);
    this.panel_cardOut.addChild(outCard, 100);

    var length = this.cardOutArray.length;
    var order = this.panel_cardOut.getLocalZOrder();
    this.panel_cardOut.getParent().reorderChild(this.panel_cardOut, order + 10);
    this.panel_cardOut.runAction(cc.sequence(
      cc.delayTime(1.0),
      cc.callFunc(function () {
        this.panel_cardOut.getParent().reorderChild(this.panel_cardOut, -1);
      }.bind(this))
    ));

    // var spawnShow = cc.sequence(cc.hide(),cc.moveTo(WHCommonParam.PutOut1stTime, this.posCenterCardOut),
    //   cc.scaleTo(WHCommonParam.PutOut1stTime, WHCommonParam.PutOutScale),cc.show()
    // );

    outCard.runAction(cc.sequence(cc.delayTime(WHCommonParam.ShowDelayTime),
        cc.callFunc(function () {sound.playCardDown();}),
        cc.delayTime(0.1),
        cc.callFunc(function () {
          this.getParent().reorderChild(this,20-length);
          newOutCard.setVisible(true);
          newOutCard.runIndicator();
        }.bind(outCard)),
        cc.callFunc(function(){
          if(MajhongInfo.GameMode == GameMode.RECORD) {
            whmajhong.record.postNextStep();
          }
          outCard.removeFromParent();
        })
    ));
    this.putOutCardEnd(card);
    this.resetPanelInChild();
  },

  autoPutOutCard: function () {
    if (this.moCard != null) {
      var paiData = this.moCard.paiOfCard().objectOfPai();


      this.runAction(cc.sequence(cc.delayTime(0.2),
        cc.callFunc(this.autoSelect.bind(this)),
        cc.delayTime(0.2),
        cc.callFunc(this.autoPutOut.bind(this)),
        cc.delayTime(0.2),
        cc.callFunc(this.autoDelCard.bind(paiData))
      ));
    }
  },

  autoSelect: function () {
    this.moCard.playSelectedAnimation(true);
  },

  autoPutOut: function () {
    var soundData = {};
    console.log("打牌="+this.moCard);
    soundData['cardType'] = this.moCard.paiOfCard().keyOfPai();
    soundData['userSex'] = this.sexType;
    sound.playCard(soundData);
    this.putOutCardAnimation(this.moCard);
  },

  autoDelCard: function () {
    whmajhong.net.updatePlayerDelCard(this, function (data) {

    }.bind(this));

  },

  putOutCardEnd: function (card) {
    if (card == this.moCard) {
      this.moCard.removeFromParent();
      this.moCard = null;
    } else {
      if (this.moCard != null) {
        this.addNewHandCard(this.moCard);
      }
      this.removeOutHandCard(card);

      this.moCard = null;
    }
  },

  addNewHandCard: function (card) {
    this.cardInArray.push(card);
    this.cardInArray = this.cardInArray.sort(this.sortCardList);
    this.resetHandCardsPos();
    card.playInsertAnimation();
  },

  resetHandCardsPos: function () {
    for (var i = 0; i < this.cardInArray.length; i++) {
      this.cardInArray[i].setPosition(this.getIndexPosX(this.cardInArray[i], i), 0);
      if( i + 1 == MajhongInfo.MajhongNumber)
      {
        this.cardInArray[i].setPosition(this.getIndexPosX(this.cardInArray[i], i) + this.moCardGap, 0);
      }
    }
  },
  //********quanzhou*********
  kaijinEvent:function(event) {
    var data = event.getUserData();
    var key = data["type"]+data["value"];
    for(var i = this.cardInArray.length -1 ; i >= 0;i--){
      var card = this.cardInArray[i];
      if(key == card.paiOfCard().keyOfPai()){
        card.setJin();
      }
    }
    if(this.moCard != null && key == this.moCard.paiOfCard().keyOfPai())
    {
      this.moCard.setJin();
    }
    this.cardInArray = this.cardInArray.sort(this.sortCardList);
    this.resetHandCardsPos();
  },

  kaipiziEvent:function(event) {
    var data = event.getUserData();
    var key = data["type"]+data["value"];
    for(var i = this.cardInArray.length -1 ; i >= 0;i--){
      var card = this.cardInArray[i];
      if(key == card.paiOfCard().keyOfPai()){
        card.setPi();
      }
    }
    if(this.moCard != null && key == this.moCard.paiOfCard().keyOfPai())
    {
      this.moCard.setPi();
    }
    this.cardInArray = this.cardInArray.sort(this.sortCardList);
    this.resetHandCardsPos();
  },

  opEvent:function(event) {
    var data = event.getUserData();
    console.log("触摸="+JSON.stringify(data));
    this.isAction = data;
    if(this.isAction)
    {
      this.setCardInTouchEnable(false);
    }
    // else
    //{
    //  this.setCardInTouchEnable(true);
    //}
  },

  removeHuaPaiCards:function(event) {
    var data = event.getUserData();
    console.log(JSON.stringify(data)+"##################2222");
    if (!!data.pai)
    {
      var huapai = data["pai"];
      var first = null;
      for (var j = this.cardInArray.length - 1; j >= 0; j--) {
        var card = this.cardInArray[j];
        console.log(JSON.stringify(card.paiOfCard())+"##################333333");
        if (card.paiOfCard().isQiDongHuaPai()) {
          this.cardInArray.splice(j, 1);
          card.removeFromParent();
        }
      }

      if(this.moCard != null && this.moCard.paiOfCard().isQiDongHuaPai())
      {
        first = huapai.shift();
        this.moCard.removeFromParent();
        this.moCard = null;
      }
      for(var i = 0; i<huapai.length;i++)
      {
        var card = new WHMyCard(this,huapai[i]);
        card.setPosition((card,i+this.cardInArray.length),0);
        this.cardInArray.push(card);
        this.panel_cardIn.addChild(card);
      }
      if(first != null)
      {
        this.addMoCard(first);
      }
      if(huapai.length > 0)
      {
        this.cardInArray = this.cardInArray.sort(this.sortCardList);
        this.resetPanelInChild();
      }
    }
  },
  //---------quanzhou-----------

  removeOutHandCard: function (card) {
    for (var i = 0; i < this.cardInArray.length; i++) {
      var tmpCard = this.cardInArray[i];
      if (tmpCard == card) {
        this.cardInArray.splice(i, 1);
        card.removeFromParent();
        break;
      }
    }
  },

  addPengCardsPanel: function (cardObj ,sourceChair) {
    var panelPeng = this.pengPanel.clone();
    var numPanel = this.getShowPanelCount();
    for (var i = 0; i < 3; i++) {
      var card = new WHCardShowUp(cardObj,CARD_SITE.HAND_PENG);
      card.x = (panelPeng.getContentSize().width/3)*i;
      card.y = 0;
      panelPeng.addChild(card, i);
      if(sourceChair　!= undefined && sourceChair != null && sourceChair== i )
      {
        card.showBlue();
      }
    }
    panelPeng.index = numPanel;
    panelPeng.x = this.posXOfPanel();
    panelPeng.y = 0;
    panelPeng.setVisible(true);
    this.panel_cardIn.addChild(panelPeng);
    this.pengArray.push(cardObj);
    this.pengPanelArray.push(panelPeng);
  },

  removePengCards: function (data) {
    var msg = data["msg"];
    var opType = msg["opType"];
    var opCard = msg["opCard"];
    var cards = msg["cards"];
    var key = opCard["type"] + opCard["value"];

    var index = 0;
    for (var i = this.cardInArray.length - 1; i >= 0; i--) {
      var card = this.cardInArray[i];
      if (key == card.paiOfCard().keyOfPai() && index < 2) {
        this.cardInArray.splice(i, 1);
        card.removeFromParent();
        index++;
        if (index >= 2) {
          break;
        }
      }
    }
  },

  addBuzhangCardsPanel: function (cardObj,gang_type,sourceChair) {

    if(gang_type > 3)
    {
      return;
    }
    var numPanel = this.getShowPanelCount();
    var key = cardObj['type'] + cardObj['value'];
    for (var i = 0; i < this.pengArray.length; i++) {
      var tmp = this.pengArray[i];
      var tmpKey = null;
      if (tmp['type'] == undefined) tmpKey = tmp;
      else  tmpKey = tmp['type'] + tmp['value'];

      if (tmpKey == key) {
        this.pengArray.splice(i, 1);
        var panel = this.pengPanelArray[i];
        numPanel = panel.index;
        this.pengPanelArray.splice(i, 1);
        panel.removeFromParent();
        break;
      }
    }

    var panelPeng = this.pengPanel.clone();
    for (var i = 0; i < 4; i++) {
      var card = new WHCardShowUp(cardObj);
      
      if (i == 3) {
        card.x = panelPeng.getContentSize().width/3;
        card.y = panelPeng.getContentSize().height*0.15;
        if(gang_type == OPER_GANG_TYPE.GANG_OTHER && sourceChair == 1)
        {
          card.showBlue();
        }
      } else {
        card.x = (panelPeng.getContentSize().width/3)*i;
        card.y = 0;
        if(gang_type == OPER_GANG_TYPE.GANG_AN)
        {
          card.SetBack();
        }

        if(gang_type == OPER_GANG_TYPE.GANG_OTHER )
        {
          if(i==0 || i==2)
          {
            if(sourceChair == i)
            {
              card.showBlue();
            }
          }
        }
      }

      panelPeng.addChild(card, i);

    }
    panelPeng.index = numPanel;
    panelPeng.x = this.posXOfPanel();
    panelPeng.y = 0;
    panelPeng.setVisible(true);

    this.buzhangArray.push(cardObj);
    this.buzhangPanelArray.push(panelPeng);
    this.panel_cardIn.addChild(panelPeng);
  },
  addGDGangCardsPanel:function(cardObj,gang_type)
  {
    if(gang_type> 3)
    {
      var length = this.cardGDGangArry.length;
      var index = length%WHCommonParam.DeskOneNum;
      var floor = Math.floor(length/WHCommonParam.DeskOneNum);
      var card = new WHCardDownDesk(cardObj,4);
      card.setScaleX(0.91);
      card.setScaleY(0.93);
      card.y = 0;
      var offx = card.getContentSize().width*0.86*WHCommonParam.DownCardGap*length-5;
      card.x = offx;
      var order = [4,5,6,7,8,9,3,2,1,0];

      this.cardGdGangPanel.addChild(card,order[index]+floor*10);
      this.cardGdGangPanel.setScale(0.7);
      this.cardGDGangArry.push(card);
      return card;
    }
  },


  addHu: function (msg) {
    for(var i=0;i<this.cardInArray.length;i++)
    {
      this.cardInArray[i].removeFromParent();
    }
    this.cardInArray.splice(0,this.cardInArray.length);

    var handCards = this.getHandCards(msg);
    var huHands = this.getHuCards(msg);

    for(var i=0;i<handCards.length;i++)
    {
      var cardShow = new WHCardShowUp(handCards[i],CARD_SITE.HAND_HU);
      this.panel_cardIn.addChild(cardShow,i);
      this.cardInArray.push(cardShow);
    }
    this.cardInArray = this.cardInArray.sort(this.sortCardList);
    this.resetPanelInChild();

    for(var i=0;i<huHands.length;i++)
    {
      var cardShow = new WHCardShowUp(huHands[i],CARD_SITE.HAND_HU);
      var xx = this.posXOfPanel();
      cardShow.setPosition(xx, 0);
      this.panel_cardIn.addChild(cardShow,i+20);
      this.cardInArray.push(cardShow);
    }
  },


  removeBuzhangCards: function (data) {
    var msg = data["msg"];
    var opType = msg["opType"];
    var opCard = msg["opCard"];
    var cards = msg["cards"];
    var key = opCard["type"] + opCard["value"];
    var origin = msg["origin"];
    if(origin >3)
    {
      var buType = msg["buType"];
      if(buType == 1)
      {
        if (this.moCard != null && this.moCard.paiOfCard().keyOfPai() == key) {
          this.moCard.removeFromParent();
          this.moCard = null;
          return;
        }

        var index = 0;
        for (var i = this.cardInArray.length - 1; i >= 0; i--) {
          var card = this.cardInArray[i];
          if (key == card.paiOfCard().keyOfPai()) {
            this.cardInArray.splice(i, 1);
            card.removeFromParent();
            break;
          }
        }
      }

      return;
    }
    if (this.moCard != null && this.moCard.paiOfCard().keyOfPai() == key) {
      this.moCard.removeFromParent();
      this.moCard = null;
    }

    var index = 0;
    for (var i = this.cardInArray.length - 1; i >= 0; i--) {
      var card = this.cardInArray[i];
      if (key == card.paiOfCard().keyOfPai()) {
        this.cardInArray.splice(i, 1);
        card.removeFromParent();
      }
    }
  },

  removeGangCards: function (data) {
    var msg = data["msg"];
    var opType = msg["opType"];
    var opCard = msg["opCard"];
    var cards = msg["cards"];
    var key = opCard["type"] + opCard["value"];

    var index = 0;
    if (this.moCard != null && this.moCard.paiOfCard().keyOfPai() == key) {
      this.moCard.removeFromParent();
      this.moCard = null;
    }
    for (var i = this.cardInArray.length - 1; i >= 0; i--) {
      var card = this.cardInArray[i];
      if (key == card.paiOfCard().keyOfPai()) {
        this.cardInArray.splice(i, 1);
        card.removeFromParent();
      }
    }
  },


  addChiCardsPanel: function (cardArray) {
    var panelCell = this.pengPanel.clone();
    var numPanel = this.getShowPanelCount();
    for (var i = 0; i < cardArray.length; i++) {
      var card = new WHCardShowUp(cardArray[i],CARD_SITE.HAND_CHI);
      card.x = (panelCell.getContentSize().width/3)*i;
      card.y = 0;
      panelCell.addChild(card);
      if(i == 1)
      {
        card.showBlue();
      }
    }

    panelCell.index = numPanel;
    panelCell.x = this.posXOfPanel();
    panelCell.y = 0;
    panelCell.setVisible(true);
    this.chiPanelArray.push(panelCell);
    this.panel_cardIn.addChild(panelCell);
    this.chiArray.push(cardArray);
  },

  removeChiCards: function (data) {
    var msg = data["msg"];
    var opType = msg["opType"];
    var opCard = msg["opCard"];
    var cards = msg["cards"];
    var key = opCard["type"] + opCard["value"];
    for (var i = 0; i < cards.length; i++) {
      var tmpCard = cards[i];
      var tmpKey = tmpCard["type"] + tmpCard["value"];
      if (tmpKey == key) {
        continue;
      }
      this.removeHandInCard(tmpCard);
    }

  },

  removeHandInTargetCard: function (card) {
    JJLog.print('card ');
    JJLog.print(card);
    var cardValue = card["type"] + card["value"];
    for (var i = this.cardInArray.length - 1; i >= 0; i--) {
      var card = this.cardInArray[i];
      if (cardValue == card.paiOfCard().keyOfPai()) {
        this.cardInArray.splice(i, 1);
        card.removeFromParent();
        break;
      }
    }
  },

  removeHandInCard: function (card) {
    var cardValue = card["type"] + card["value"];
    for (var i = this.cardInArray.length - 1; i >= 0; i--) {
      var card = this.cardInArray[i];
      if (cardValue == card.paiOfCard().keyOfPai()) {
        this.cardInArray.splice(i, 1);
        card.removeFromParent();
        break;
      }
    }
  },

  initUI:function()
  {
    this._super();
    if(MajhongInfo.MajhongNumber > 14)
    {
      this.pengPanel.setScale(WHCommonParam.My17CardShowScale);
    }else
    {
      this.pengPanel.setScale(WHCommonParam.My14CardShowScale);
    }
    this.gap_panel = this.pengPanel.getContentSize().width*0.1*this.pengPanel.getScale();
  },

  posXOfPanel: function () {
    var panelWidth = this.pengPanel.getContentSize().width*this.pengPanel.getScale();
    var pos = 0;
    var numPanel = this.getShowPanelCount();
    if (numPanel > 0) {
      var length = numPanel * panelWidth;
      var gaps = numPanel * this.gap_panel;
      pos += length;
      pos += gaps;
    }

    var numCard = this.cardInArray.length;
    if (numCard > 0) {
      var card = this.cardInArray[0];
      var cardWidth = card.getContentSize().width*card.getScale();
      pos = pos + (cardWidth - this.gap_cardStand) * numCard;
    }

    return pos;
  },

  resetPanelInChild: function () {
    var panelLength = this.getShowPanelCount();
    var panelWidth = this.pengPanel.getContentSize().width*this.pengPanel.getScale()+ this.gap_panel;
    var posXNext = panelLength*panelWidth;
    for (var i = 0; i < this.buzhangPanelArray.length; i++) {
      var panel = this.buzhangPanelArray[i];
      panel.x = panel.index*panelWidth;
      panel.y = 0;
    }

    for (var i = 0; i < this.pengPanelArray.length; i++) {
      var panel = this.pengPanelArray[i];
      panel.x = panel.index*panelWidth;
      panel.y = 0;
    }

    for (var i = 0; i < this.chiPanelArray.length; i++) {
      var panel = this.chiPanelArray[i];
      panel.x = panel.index*panelWidth;
      panel.y = 0;
    }
    if(this.moCard != null)
    {
      this.cardInArray.push(this.moCard);
      this.moCard = null;
    }
    this.cardInArray = this.cardInArray.sort(this.sortCardList);
    for (var i = 0; i < this.cardInArray.length; i++) {
      var card = this.cardInArray[i];
      var cardSize = card.getContentSize();
      card.x = posXNext + cardSize.width * i - this.gap_cardStand * i;
      card.y = 0;
      if(panelLength*3 + i + 1 == MajhongInfo.MajhongNumber)
      {
        card.x += this.moCardGap;
      }
    }
  },

  showAllCards: function (msg) {

    for(var i=0;i<this.cardInArray.length;i++)
    {
      this.cardInArray[i].removeFromParent();
    }
    this.cardInArray.splice(0,this.cardInArray.length);

    var handCards = this.getHandCards(msg);
    var huHands = this.getHuCards(msg);

    for(var i=0;i<handCards.length;i++)
    {
      var cardShow = new WHCardShowUp(handCards[i],CARD_SITE.HAND_HU);
      this.panel_cardIn.addChild(cardShow,i);
      this.cardInArray.push(cardShow);
    }

    this.cardInArray = this.cardInArray.sort(this.sortCardList);

    for(var i=0;i<this.cardInArray.length;i++)
    {
      var cardShow = this.cardInArray[i];
      var cardShowSize = cardShow.getContentSize();
      cardShow.x = posXNext ;
      cardShow.y = 0;
      posXNext = posXNext + (cardShowSize.width-2);
      this.panel_cardIn.reorderChild(cardShow,i);
    }

    for(var i=0;i<huHands.length;i++)
    {
      var cardShow = new WHCardShowUp(huHands[i],CARD_SITE.HAND_HU);
      cardShow.x = posXNext +20 ;
      cardShow.y = 0;
      posXNext = posXNext + (cardShowSize.width-2);
      this.panel_cardIn.addChild(cardShow,i+20);
      this.cardInArray.push(cardShow);
    }
  },
  onGuo: function () {
    var _this = this;
    if(this.qihu_tip)
    {
      var dialog = new JJMajhongDecideDialog();
      dialog.setDes('确定放弃胡牌？');
      dialog.setCallback(function () {
        _this.qihu_tip = false;
        _this.onGuo();
      });
      dialog.showDialog();
      return;
    }
    var data = {};
    data["opType"] = OPERATIONNAME.GUO;
    _this.dismissControlPanel();

    if(_this.gangMode == 1 )
    {
      for (var i = 0; i < this.cardInArray.length; i++)
      {
        var handCard = this.cardInArray[i];
        handCard.showWhite();
      }

      _this.gangMode = 0;
    }
    whmajhong.net.updatePlayerOp(data, function (data) {
      JJLog.print(JSON.stringify(data));

    });

  },

  showControlPanel: function (data) {
    var _this = this;
    var opData = data["opCard"];
    var panelSize = 0;

    if(this.gangMode > 1)
    {
      var huData = data[OPERATIONNAME.HU];
      if (huData == 1) {
        var cellData = {};
        cellData["opType"] = OPERATIONNAME.HU;
        cellData["opCard"] = opData;
        cellData["index"] = -1;
        cellData['pai'] = opData;
        whmajhong.net.updatePlayerOp(cellData, function (data) {
        });
        return;
      }
    }

    for (var tag in data) {
      switch (tag) {
        case OPERATIONNAME.CHI:
        {
          var chiData = data[tag];
          var length = chiData.length;
          if (length <= 0) {
            break;
          }
          var panel_cell = this.panel_controlCell.clone();
          var panel_sub = ccui.helper.seekWidgetByName(panel_cell, "panel_sub");
          panel_sub.setVisible(false);

          var btn_gang = ccui.helper.seekWidgetByName(panel_cell, "btn_gang");
          btn_gang.setVisible(false);
          var btn_peng = ccui.helper.seekWidgetByName(panel_cell, "btn_peng");
          btn_peng.setVisible(false);
          var btn_chi = ccui.helper.seekWidgetByName(panel_cell, "btn_chi");
          btn_chi.setVisible(true);

          var btn_buzhang = ccui.helper.seekWidgetByName(panel_cell, "btn_buzhang");
          btn_buzhang.setVisible(false);
	      var btn_ting = ccui.helper.seekWidgetByName(panel_cell, "btn_ting");
          btn_ting.setVisible(false);
          var btn_hu = ccui.helper.seekWidgetByName(panel_cell, "btn_hu");
          btn_hu.setVisible(false);

          panelSize++;
          this.panel_control.addChild(panel_cell, OPERATIONTYPE.CHI, OPERATIONTYPE.CHI);
          panel_cell.x = 1000 - panel_cell.getContentSize().width * panelSize;
          panel_cell.y = 0;
          panel_cell.setVisible(true);

          if (chiData.length == 1) {
            var cellChiData = {};
            cellChiData["opType"] = OPERATIONNAME.CHI;
            cellChiData["opCard"] = opData;
            cellChiData["index"] = 0;
            btn_chi.addClickEventListener(function () {
              if(_this.isdahu>0)
              {
                  var str = "您已经";
                  if(_this.isdahu == 1) str += '游金';
                  if(_this.isdahu == 2) str += '双游';
                  if(_this.isdahu == 3) str += '三游';
                  str += '了，确定吃？'
                  var dialog = new JJMajhongDecideDialog();
                  dialog.setDes(str);
                  dialog.setCallback(function () {
                    _this.dismissControlPanel();
                    whmajhong.net.updatePlayerOp(cellChiData, function (data) {
                      if (data["code"] == 200) {
                      }
                    });
                  });
                  dialog.showDialog();
                  return;
              }
              _this.dismissControlPanel();
              whmajhong.net.updatePlayerOp(this, function (data) {
                if (data["code"] == 200) {
                }
              });

            }.bind(cellChiData));
          } else {
            btn_chi.addClickEventListener(function () {
              if(_this.isdahu>0)
              {
                var str = "您已经";
                if(_this.isdahu == 1) str += '游金';
                if(_this.isdahu == 2) str += '双游';
                if(_this.isdahu == 3) str += '三游';
                str += '了，确定吃？'
                var dialog = new JJMajhongDecideDialog();
                dialog.setDes(str);
                dialog.setCallback(function () {
                  panel_sub.setVisible(!panel_sub.isVisible());
                });
                dialog.showDialog();
                return;
              }
              panel_sub.setVisible(!panel_sub.isVisible());
            });
            panel_sub.setVisible(false);

            for (var i = 0; i < chiData.length; i++) {
              var subData = chiData[i];
              var cell = ccui.helper.seekWidgetByName(panel_sub, "panel_sub_cell");
              var cell2 = cell.clone();
              cell.setVisible(false);
              cell2.setTouchEnabled(true);
              var cellChiData = {};
              cellChiData["opType"] = OPERATIONNAME.CHI;
              cellChiData["opCard"] = opData;
              cellChiData["index"] = i;
              cell2.addClickEventListener(function () {
                _this.dismissControlPanel();
                whmajhong.net.updatePlayerOp(this, function (data) {
                  JJLog.print("update player op response");
                  JJLog.print(JSON.stringify(data));
                  if (data["code"] == 200) {
                    //_this.dismissControlPanel();
                  }
                });

              }.bind(cellChiData));

              for (var j = 0; j < subData.length; j++) {
                var cardObj = subData[j];
                var tmpCard = new WHCardShowUp(cardObj);
                if(cardObj.value == opData.value) tmpCard.showBlue();
                cell2.addChild(tmpCard);
                tmpCard.y = 0;
                tmpCard.x = 10.5 + 89 * j;
              }
              cell2.setVisible(true);
              panel_sub.addChild(cell2);
              cell2.x = 540 - 287 * (i + 1);
              cell2.y = 0;
            }
          }
        }
          break;
        case OPERATIONNAME.PENG:
        {
          var pengData = data[tag];
          if (pengData == 1) {
            var panel_cell = this.panel_controlCell.clone();
            var panel_sub_peng = ccui.helper.seekWidgetByName(panel_cell, "panel_sub");
            panel_sub_peng.setVisible(false);
            var btn_gang = ccui.helper.seekWidgetByName(panel_cell, "btn_gang");
            btn_gang.setVisible(false);
            var btn_peng = ccui.helper.seekWidgetByName(panel_cell, "btn_peng");
            btn_peng.setVisible(true);
            var btn_buzhang = ccui.helper.seekWidgetByName(panel_cell, "btn_buzhang");
            btn_buzhang.setVisible(false);
            var btn_ting = ccui.helper.seekWidgetByName(panel_cell, "btn_ting");
            btn_ting.setVisible(false);
            var btn_chi = ccui.helper.seekWidgetByName(panel_cell, "btn_chi");
            btn_chi.setVisible(false);

            var btn_hu = ccui.helper.seekWidgetByName(panel_cell, "btn_hu");
            btn_hu.setVisible(false);

            var cellPengData = {};
            cellPengData["opType"] = OPERATIONNAME.PENG;
            cellPengData["opCard"] = opData;
            cellPengData["index"] = -1;
            btn_peng.addClickEventListener(function () {
              if(_this.isdahu>0)
              {
                var str = "您已经";
                if(_this.isdahu == 1) str += '游金';
                if(_this.isdahu == 2) str += '双游';
                if(_this.isdahu == 3) str += '三游';
                str += '了，确定碰？'
                var dialog = new JJMajhongDecideDialog();
                dialog.setDes(str);
                dialog.setCallback(function () {
                  _this.dismissControlPanel();
                  whmajhong.net.updatePlayerOp(this, function (data) {
                    if (data["code"] == 200) {
                      //_this.dismissControlPanel();
                    }
                  });
                }.bind(this));
                dialog.showDialog();
                return;
              }
              _this.dismissControlPanel();
              whmajhong.net.updatePlayerOp(this, function (data) {
                JJLog.print("update player PENG op response");

                JJLog.print(JSON.stringify(data));
                if (data["code"] == 200) {
                  //_this.dismissControlPanel();
                }
              });

            }.bind(cellPengData));

            // var card = new WHCardShowUp(opData);
            // card.x = 113;
            // card.y = 2;
            // panel_cell.addChild(card);

            panelSize++;
            this.panel_control.addChild(panel_cell, OPERATIONTYPE.PENG, OPERATIONTYPE.PENG);
            panel_cell.x = 1000 - panel_cell.getContentSize().width * panelSize;
            panel_cell.y = 0;
            panel_cell.setVisible(true);
          }
        }
          break;
        case OPERATIONNAME.BUZHANG:
        {
          var buzhangData = data[tag];
          var length = buzhangData.length;
          if (length <= 0) {
            break;
          }
          var panel_cell_buzhang = this.panel_controlCell.clone();

          var panel_sub_buzhang = ccui.helper.seekWidgetByName(panel_cell_buzhang, "panel_sub");
          panel_sub_buzhang.setVisible(false);

          var btn_gang = ccui.helper.seekWidgetByName(panel_cell_buzhang, "btn_gang");
          btn_gang.setVisible(true);
          var btn_peng = ccui.helper.seekWidgetByName(panel_cell_buzhang, "btn_peng");
          btn_peng.setVisible(false);
          var btn_chi = ccui.helper.seekWidgetByName(panel_cell_buzhang, "btn_chi");
          btn_chi.setVisible(false);
          var btn_hu = ccui.helper.seekWidgetByName(panel_cell_buzhang, "btn_hu");
          btn_hu.setVisible(false);
          var btn_buzhang = ccui.helper.seekWidgetByName(panel_cell_buzhang, "btn_buzhang");
          btn_buzhang.setVisible(false);
          var btn_ting = ccui.helper.seekWidgetByName(panel_cell_buzhang, "btn_ting");
          btn_ting.setVisible(false);
          panelSize++;
          this.panel_control.addChild(panel_cell_buzhang, OPERATIONTYPE.GANG, OPERATIONTYPE.GANG);
          panel_cell_buzhang.x = 1000 - panel_cell_buzhang.getContentSize().width * panelSize;
          panel_cell_buzhang.y = 0;
          panel_cell_buzhang.setVisible(true);

          if (buzhangData.length == 1) {
            var subData = buzhangData[0];
            var paiData = subData['pai'];
            var origin = subData['origin'];
            var cellGangData = {};
            cellGangData["opType"] = OPERATIONNAME.BUZHANG;
            cellGangData["opCard"] = paiData;
            cellGangData["index"] = origin;

            // var card = new WHCardShowUp(cellData["opCard"]);
            // card.x = 113;
            // card.y = 2;
            // panel_cell_buzhang.addChild(card);

            btn_gang.addClickEventListener(function () {
              _this.dismissControlPanel();
              whmajhong.net.updatePlayerOp(this, function (data) {
                JJLog.print("update buzhang player op response");
                JJLog.print(JSON.stringify(data));
                if (data["code"] == 200) {
                  //_this.dismissControlPanel();
                }
              });
            }.bind(cellGangData));

          } else {
            btn_gang.addClickEventListener(function () {
              panel_sub_buzhang.setVisible(!panel_sub_buzhang.isVisible());
            });

            var panel_sub_buzhang = ccui.helper.seekWidgetByName(panel_cell_buzhang, "panel_sub");
            panel_sub_buzhang.setVisible(false);
            var ganglength = 0;
            for (var i = 0; i < buzhangData.length; i++)
            {
              if(buzhangData[i]['origin'] < 4)
              {
                ganglength ++;
              }
            }

            for (var i = 0; i < buzhangData.length; i++) {
              var subData = buzhangData[i];
              var paiData = subData['pai'];
              var origin = subData['origin'];
              var cell = ccui.helper.seekWidgetByName(panel_sub_buzhang, "panel_sub_gang_cell");
              var cell2 = cell.clone();
              cell.setVisible(false);
              cell2.setTouchEnabled(true);
              var cellGangData = {};
              cellGangData["opType"] = OPERATIONNAME.BUZHANG;
              cellGangData["opCard"] = paiData;
              cellGangData["index"] = origin;
              cell2.addClickEventListener(function () {
                JJLog.print("buzhang click index = ");
                _this.dismissControlPanel();
                whmajhong.net.updatePlayerOp(this, function (data) {
                  JJLog.print("update buzhang player op response");
                  JJLog.print(JSON.stringify(data));
                  if (data["code"] == 200) {
                    //_this.dismissControlPanel();
                  }
                });

              }.bind(cellGangData));

              if(origin > 3)
              {

                cell2.setContentSize(110,140);
                for (var j = 0; j < 1; j++) {
                  var tmpCard = new WHCardShowUp(paiData);
                  cell2.addChild(tmpCard);
                  tmpCard.y = 0;
                  tmpCard.x = 10.5 + 89 * j;
                }
                cell2.setVisible(true);
                panel_sub_buzhang.addChild(cell2);
                cell2.x = 740 - 376*ganglength- 110* (i + 1);
                cell.y = 0;

              }else
              {
                for (var j = 0; j < 4; j++) {
                  var tmpCard = new WHCardShowUp(paiData);
                  cell2.addChild(tmpCard);
                  tmpCard.y = 0;
                  tmpCard.x = 10.5 + 89 * j;
                }
                cell2.setVisible(true);
                panel_sub_buzhang.addChild(cell2);
                cell2.x = 740 - 376* (i + 1);
                cell.y = 0;
              }
              JJLog.print("宽度=" + cell2.getContentSize().width);

            }
          }


        }
          break;
        case OPERATIONNAME.TING:
        {
          var tingData = data[tag];
          var length = tingData.length;
          if (length <= 0) {
            break;
          }
          var panel_cell_ting = this.panel_controlCell.clone();
          var panel_sub_ting = ccui.helper.seekWidgetByName(panel_cell_ting, "panel_sub");
          panel_sub_ting.setVisible(false);

          var btn_ting = ccui.helper.seekWidgetByName(panel_cell_ting, "btn_ting");
          var cellData = {};
          cellData["opType"] = OPERATIONNAME.TING;
          cellData["opCard"] = {};
          cellData["index"] = -1;
          btn_ting.addClickEventListener(function () {
            _this.readyTing(tingData);
            btn_ting.setVisible(false);
            _this.setCardInTouchEnable(true);
          }.bind(cellData));
          btn_ting.setVisible(true);
          var btn_peng = ccui.helper.seekWidgetByName(panel_cell_ting, "btn_peng");
          btn_peng.setVisible(false);
          var btn_gang = ccui.helper.seekWidgetByName(panel_cell_ting, "btn_gang");
          btn_gang.setVisible(false);
          var btn_chi = ccui.helper.seekWidgetByName(panel_cell_ting, "btn_chi");
          btn_chi.setVisible(false);
          var btn_hu = ccui.helper.seekWidgetByName(panel_cell_ting, "btn_hu");
          btn_hu.setVisible(false);
          panelSize++;
          this.panel_control.addChild(panel_cell_ting, OPERATIONTYPE.TING, OPERATIONTYPE.TING);
          panel_cell_ting.x = 1000 - panel_cell_ting.getContentSize().width * panelSize;
          panel_cell_ting.y = 0;
          panel_cell_ting.setVisible(true);

        }
          break;
        case OPERATIONNAME.GANG:
        {
          var buzhangData = data[tag];
          var length = buzhangData.length;
          if (length <= 0) {
            break;
          }
          var panel_cell_buzhang = this.panel_controlCell.clone();

          var panel_sub_buzhang = ccui.helper.seekWidgetByName(panel_cell_buzhang, "panel_sub");
          panel_sub_buzhang.setVisible(false);

          var btn_gang = ccui.helper.seekWidgetByName(panel_cell_buzhang, "btn_gang");
          btn_gang.setVisible(true);
          var btn_peng = ccui.helper.seekWidgetByName(panel_cell_buzhang, "btn_peng");
          btn_peng.setVisible(false);
          var btn_chi = ccui.helper.seekWidgetByName(panel_cell_buzhang, "btn_chi");
          btn_chi.setVisible(false);
          var btn_hu = ccui.helper.seekWidgetByName(panel_cell_buzhang, "btn_hu");
          btn_hu.setVisible(false);
          var btn_buzhang = ccui.helper.seekWidgetByName(panel_cell_buzhang, "btn_buzhang");
          btn_buzhang.setVisible(false);
          var btn_ting = ccui.helper.seekWidgetByName(panel_cell_buzhang, "btn_ting");
          btn_ting.setVisible(false);
          panelSize++;
          this.panel_control.addChild(panel_cell_buzhang, OPERATIONTYPE.GANG, OPERATIONTYPE.GANG);
          panel_cell_buzhang.x = 1000 - panel_cell_buzhang.getContentSize().width * panelSize;
          panel_cell_buzhang.y = 0;
          panel_cell_buzhang.setVisible(true);

          if (buzhangData.length == 1) {
            var subData = buzhangData[0];
            var paiData = subData['pai'];
            var origin = subData['origin'];
            var cellGangData = {};
            cellGangData["opType"] = OPERATIONNAME.GANG;
            cellGangData["opCard"] = paiData;
            cellGangData["index"] = origin;

            // var card = new WHCardShowUp(cellData["opCard"]);
            // card.x = 113;
            // card.y = 2;
            // panel_cell_buzhang.addChild(card);

            btn_gang.addClickEventListener(function () {
              if(_this.isdahu>0)
              {
                var str = "您已经";
                if(_this.isdahu == 1) str += '游金';
                if(_this.isdahu == 2) str += '双游';
                if(_this.isdahu == 3) str += '三游';
                str += '了，确定杠？'
                var dialog = new JJMajhongDecideDialog();
                dialog.setDes(str);
                dialog.setCallback(function () {
                  _this.dismissControlPanel();
                  whmajhong.net.updatePlayerOp(this, function (data) {
                    if (data["code"] == 200) {
                      //_this.dismissControlPanel();
                    }
                  });
                }.bind(this));
                dialog.showDialog();
                return;
              }
              _this.dismissControlPanel();
              whmajhong.net.updatePlayerOp(this, function (data) {
                JJLog.print("update buzhang player op response");
                JJLog.print(JSON.stringify(data));
                if (data["code"] == 200) {
                  //_this.dismissControlPanel();
                }
              });
            }.bind(cellGangData));

          } else {
            btn_gang.addClickEventListener(function () {
              if(_this.isdahu>0)
              {
                var str = "您已经";
                if(_this.isdahu == 1) str += '游金';
                if(_this.isdahu == 2) str += '双游';
                if(_this.isdahu == 3) str += '三游';
                str += '了，确定杠？'
                var dialog = new JJMajhongDecideDialog();
                dialog.setDes(str);
                dialog.setCallback(function () {
                  panel_sub_buzhang.setVisible(!panel_sub_buzhang.isVisible());
                });
                dialog.showDialog();
                return;
              }
              panel_sub_buzhang.setVisible(!panel_sub_buzhang.isVisible());
            });

            var panel_sub_buzhang = ccui.helper.seekWidgetByName(panel_cell_buzhang, "panel_sub");
            panel_sub_buzhang.setVisible(false);
            for (var i = 0; i < buzhangData.length; i++) {
              var subData = buzhangData[i];
              var paiData = subData['pai'];
              var origin = subData['origin'];
              var cell = ccui.helper.seekWidgetByName(panel_sub_buzhang, "panel_sub_gang_cell");
              var cell2 = cell.clone();
              cell.setVisible(false);
              cell2.setTouchEnabled(true);
              var cellGangData = {};
              cellGangData["opType"] = OPERATIONNAME.GANG;
              cellGangData["opCard"] = paiData;
              cellGangData["index"] = origin;
              cell2.addClickEventListener(function () {
                JJLog.print("buzhang click index = ");
                _this.dismissControlPanel();
                whmajhong.net.updatePlayerOp(this, function (data) {
                  JJLog.print("update buzhang player op response");
                  JJLog.print(JSON.stringify(data));
                  if (data["code"] == 200) {
                    //_this.dismissControlPanel();
                  }
                });

              }.bind(cellGangData));

              for (var j = 0; j < 4; j++) {
                var tmpCard = new WHCardShowUp(paiData);
                cell2.addChild(tmpCard);
                tmpCard.y = 0;
                tmpCard.x = 10.5 + 89 * j;
              }
              cell2.setVisible(true);
              panel_sub_buzhang.addChild(cell2);
              cell2.x = 740 - 376 * (i + 1);
              cell.y = 0;
            }
          }

        }
          break;
        case OPERATIONNAME.HU:
        {
          var huData = data[tag];
          var length = huData.length;
          if (huData == 0) {
            break;
          }
          var huType = data["huTp"];
          this.qihu_tip = true;
          var panel_cell_hu = this.panel_controlCell.clone();
          var panel_sub_hu = ccui.helper.seekWidgetByName(panel_cell_hu, "panel_sub");
          panel_sub_hu.setVisible(false);

          var btn_gang = ccui.helper.seekWidgetByName(panel_cell_hu, "btn_gang");
          btn_gang.setVisible(false);
          var btn_peng = ccui.helper.seekWidgetByName(panel_cell_hu, "btn_peng");
          btn_peng.setVisible(false);
          var btn_chi = ccui.helper.seekWidgetByName(panel_cell_hu, "btn_chi");
          btn_chi.setVisible(false);
          var btn_buzhang = ccui.helper.seekWidgetByName(panel_cell_hu, "btn_buzhang");
          btn_buzhang.setVisible(false);
	      var btn_ting = ccui.helper.seekWidgetByName(panel_cell_hu, "btn_ting");
          btn_ting.setVisible(false);

          var btn_hu = ccui.helper.seekWidgetByName(panel_cell_hu, "btn_hu");
          if(huType > 0)
          {
            var huRes = ['btn_zimo.png','btn_youjin.png','btn_shuangyou.png','btn_sanyou.png','btn_sanjindao.png','btn_zimo.png'];
            btn_hu.loadTextureNormal(huRes[huType],ccui.Widget.PLIST_TEXTURE);
            btn_hu.ignoreContentAdaptWithSize(true);
          }
          btn_hu.setVisible(true);
          panelSize++;
          // if(huType != 4)
          // {
          //   var card = new WHCardShowUp(opData);
          //   card.x = 118;
          //   card.y = 2;
          //   panel_cell_hu.addChild(card);
          // }

          this.panel_control.addChild(panel_cell_hu, OPERATIONTYPE.HU, OPERATIONTYPE.HU);
          panel_cell_hu.x = 1000 - panel_cell_hu.getContentSize().width * panelSize;
          panel_cell_hu.y = 0;
          panel_cell_hu.setVisible(true);

          var cellHuData = {};
          cellHuData["opType"] = OPERATIONNAME.HU;
          cellHuData["opCard"] = opData;
          cellHuData["index"] = -1;
          cellHuData['origin'] = origin;
          cellHuData['pai'] = opData;

          btn_hu.addClickEventListener(function () {
            _this.dismissControlPanel();
            whmajhong.net.updatePlayerOp(this, function (data) {
              if (data["code"] == 200) {
                //_this.dismissControlPanel();
              }
            });
          }.bind(cellHuData));

        }
          break;
      }
    }
    this.panel_guo.setVisible(true);
    this.panel_control.setVisible(true);
  },

  dismissControlPanel: function () {
    this.qihu_tip = false;
    this.panel_control.setVisible(false);
    for (var i = 0; i < 10; i++) {
      if (this.panel_control.getChildByTag(i) != null) {
        this.panel_control.removeChildByTag(i, true);
      }

    }
  },

  putInBirdCards: function (data) {
    var birdCards = data['msg']['niao'];
    if(birdCards!= undefined && birdCards != null && birdCards.length >0 )
    {
      for (var i = 0; i < birdCards.length; i++) {
        var key = birdCards[i];
        var outCard = this.addCardOut(key);
        outCard.showYellow();
      }
    }
  },

  //记录=============================
  runRecordBuhuaOpAction: function (data){
    var huapai = data["pai"];
    var spliceCount = 0;
    for(var i = 0; i<huapai.length;i++) {
      for (var j = this.cardInArray.length - 1; j >= 0; j--) {
        var card = this.cardInArray[j];
        if (card.paiOfCard().isQiDongHuaPai()) {
          this.cardInArray.splice(j, 1);
          card.removeFromParent();
          spliceCount += 1;
          break;
        }
      }
    }
      var hua = null;
      if(this.moCard != null && this.moCard.paiOfCard().isQiDongHuaPai()  && spliceCount != huapai.length)
      {
        var hua = huapai.shift();
        this.moCard.removeFromParent();
        this.moCard = null;
      }
      for(var i = 0; i<huapai.length;i++)
      {
          var card = new WHMyCard(this,huapai[i]);
          card.setPosition((card,i+this.cardInArray.length),0);
          this.cardInArray.push(card);
          this.panel_cardIn.addChild(card);
      }
      this.cardInArray = this.cardInArray.sort(this.sortCardList);
      this.resetPanelInChild();

    if(hua != null)
    {
      this.playRecordMoCard(hua);
    }else
    {
      this.postNextStep(0.2);
    }
  },

  initRecordHandCards: function () {
    var cards = whmajhong.record.selfHandCards;
    this.panel_cardIn.removeAllChildren();
    var allCards = new Array();
    for (var p in cards) {
      var arr = cards[p];
      for (var i = 0; i < arr.length; i++) {
        var card = new WHMyCard(this, arr[i]);
        if (whmajhong.record.JinPaiId == card.paiOfCard().keyOfPai())
        {
          card.setJin();
        }
        if (whmajhong.record.PiziId1 == card.paiOfCard().keyOfPai() || whmajhong.record.PiziId2 == card.paiOfCard().keyOfPai() || whmajhong.record.PiziId3 == card.paiOfCard().keyOfPai())
        {
          card.setPi();
        }
        allCards.push(card);
        this.panel_cardIn.addChild(card);
      }
    }
    allCards = allCards.sort(this.sortCardList);
    for (var i = 0 ; i < allCards.length;i++)
    {
      var card = allCards[i];
      var size = card.getContentSize();
      if (i == MajhongInfo.MajhongNumber - 1) {
        card.setPosition(size.width * (MajhongInfo.MajhongNumber - 1) - this.gap_cardStand * i + this.moCardGap, 0);
        this.moCard = card;
      } else {
        this.cardInArray.push(card);
      }
    }
    this.cardInArray = this.cardInArray.sort(this.sortCardList);
    for (var i = 0; i < this.cardInArray.length; i++) {
      var card = this.cardInArray[i];
      card.setPosition(this.getIndexPosX(card, i), 0);
    }

  },

  playRecordSend: function (cardObj) {
    var str = this.cardOfString(cardObj);
    var card = null;

    if (this.moCard != null && this.moCard.paiOfCard().keyOfPai() == str) {
      card = this.moCard;
    }

    if (card == null) {
      for (var i = 0; i < this.cardInArray.length; i++) {
        var tmp = this.cardInArray[i];
        if (tmp.paiOfCard().keyOfPai() == str) {
          card = this.cardInArray[i];
          break;
        }
      }
    }

    if (card != null) {
      this.putOutCardStart(card);
    }
  },

  playRecordMoCard: function (cardObj) {
    //var cardObj = data['pai'];
    var card = new WHMyCard(this, cardObj);
    if (this.moCard != null) {
      this.cardInArray.push(this.moCard);
      this.moCard = null;
      this.resetPanelInChild();
    }

    var xx = this.posXOfPanel() + this.moCardGap;
    card.setPosition(xx, 0);
    this.moCard = card;
    this.moCard.playEnterInAnimation();
    this.panel_cardIn.addChild(card);

    this.postNextStep(0.2);

  },


  recordAddGangPanel: function (cardObj) {
    var panelPeng = this.pengPanel.clone();
    for (var i = 0; i < 4; i++) {
      var card = new WHCardShowUp(cardObj);
      var width = card.getContentSize().width;
      card.x = (width - 3) * i;
      if (i == 3) {
        card.x = (width - 3) * 1;
        card.y = 22;
      } else {
        card.x = (width - 3) * i;
        card.y = 0;
      }

      panelPeng.addChild(card, i);

    }
    this.buzhangArray.push(cardObj);
    this.buzhangPanelArray.push(panelPeng);

    panelPeng.x = this.posXOfPanel();
    panelPeng.y = 0;
    panelPeng.setVisible(true);
    this.panel_cardIn.addChild(panelPeng);
  },

  recordGangYellowCards: function (cards) {
    for (var i = 0; i < cards.length; i++) {
      var key = cards[i];
      var outCard = new WHCardShowUp(key);
      var pos = this.posIndexOfOutCard();
      outCard.setPosition(pos);
      outCard.setScale(WHCommonParam.PutOutScaleBack);
      var num = this.cardOutArray.length;
      this.panel_cardOut.addChild(outCard, 20 - num);
      this.cardOutArray.push(outCard);
      outCard.showYellow();
    }
  },
});
