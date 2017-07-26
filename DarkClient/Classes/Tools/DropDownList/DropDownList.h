#ifndef __DropDownList_H__
#define __DropDownList_H__

#include "cocos2d.h"
#include "ui/CocosGUI.h"

USING_NS_CC;
using namespace ui;

/*下拉菜单列表cocos2d-x中没有提供，所以自制*/

class DropDownList : public Node{
public:
	DropDownList();
	~DropDownList();

	static DropDownList * create(const std::string & normalImage, const std::string & selectedImage,
		const std::string & scale9Image, ValueVector & labelList);

	bool init(const std::string & normalImage, const std::string & selectedImage,
		const std::string & scale9Image, ValueVector & labelList);

	void menuTopItemCallback(Ref * pSender);		//顶部显示区域回调
	void menuListItemCallback(Ref * pSender);		//列表菜单项回调

	typedef std::function<void(int)> ccCustomCallback;
	
	void setCallback(const ccCustomCallback & callback);		//注册回调函数
private:
	Vector<Sprite *> _spriteList;		//选中列表项图片
	Vector<Label *> _labelList;			//下拉列表项文字说明
	Node * _list;
	Label * _topLabel;
	int _currentIndex;			//选择菜单项
	ccCustomCallback _callback;		//注册的回调函数
};

#endif
