import { get } from "../../get/index.js";
import { lib } from "../index.js";
import { _status } from "../../status/index.js";
import { ui } from "../../ui/index.js";
export class Button extends HTMLDivElement {
	/**
	 * @type { string | undefined }
	 */
	// eslint-disable-next-line no-unreachable
	buttonid;
	/**
	 * @param {{}} item
	 * @param {keyof typeof ui.create.buttonPresets | ((item: {}, type: Function, position?: HTMLDivElement | DocumentFragment, noClick?: true, button?: Button) => Button)} type
	 * @param {HTMLDivElement|DocumentFragment} [position]
	 * @param {true} [noClick]
	 * @param { Button } [button]
	 */
	// @ts-expect-error ignore
	constructor(item, type, position, noClick, button) {
		if (item instanceof Button) {
			const other = item;
			// @ts-expect-error ignore
			[item, type, position, noClick, button] = other._args;
		}
		if (typeof type == "function") {
			console.log('5-0 调用[1]type自带函数');
			button = type(item, type, position, noClick, button);
		} else if (ui.create.buttonPresets[type]) {
			console.log('5-1 调用ui.create.buttonPresets   type:',type);
			button = ui.create.buttonPresets[type](item, type, position, noClick, button);
		}
		if (button) {
			Object.setPrototypeOf(button, (lib.element.Button || Button).prototype);
			if (!noClick) {
				button.addEventListener(lib.config.touchscreen ? "touchend" : "click", ui.click.button);
			} else {
				button.classList.add("noclick");
				const intro = button.querySelector(".intro");
				if (intro) {
					intro.remove();
				}
			}
			if (!button.buttonid) {
				button.buttonid = get.id();
			}
			if(button.link2s){
				console.log('5-3 新加button-附加样式：',button.link2s);
				if(button.link2s.noselect){
					console.log('5-3 ',button.classList,':',button.classList.contains('selectable'));
					//if(button.classList.contains('selectable')) button.classList.remove('selectable');
				}
				if(button.link2s.nowidth) button.style.width='auto';
				if(button.link2s.type2=='skill'){
					lib.setIntro(button);	//添加右键信息框
					button._customintro = uiintro => {
						uiintro.add(`${get.translation(button.link+'_info')}`);
					};
				}
			}
			// @ts-expect-error ignore
			button._args = [item, type, position, noClick, button];
			return button;
		} else {
			console.error([item, type, position, noClick, button]);
			throw "button不合法";
		}
	}
	exclude() {
		if (_status.event.excludeButton == undefined) {
			_status.event.excludeButton = [];
		}
		_status.event.excludeButton.add(this);
	}
	get updateTransform() {
		return lib.element.Card.prototype.updateTransform;
	}
}
