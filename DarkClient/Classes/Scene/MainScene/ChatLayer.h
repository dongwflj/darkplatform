#ifndef _ChatLayer_H_
#define _ChatLayer_H_

#include "cocos2d.h"
#include "ui/CocosGUI.h"

USING_NS_CC;
using namespace ui;

class ChatLayer : public Layer{
public:
	ChatLayer();
	~ChatLayer();

	virtual bool init();

	CREATE_FUNC(ChatLayer);
};

#endif
