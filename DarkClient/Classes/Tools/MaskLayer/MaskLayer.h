#ifndef _MaskLayer_H_
#define _MaskLayer_H_

#include "cocos2d.h"

USING_NS_CC;

/*用于屏蔽下一层的触摸*/

class MaskLayer :public Layer{
public:
	MaskLayer();
	~MaskLayer();

	virtual bool init();

	CREATE_FUNC(MaskLayer);

	bool onTouchBegan(Touch * touch, Event * event);
	void onTouchMoved(Touch * touch, Event * event);
	void onTouchEnded(Touch * touch, Event * event);
};

#endif