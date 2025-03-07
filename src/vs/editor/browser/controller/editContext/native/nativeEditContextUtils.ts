/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { addDisposableListener, getActiveElement, getShadowRoot } from '../../../../../base/browser/dom.js';
import { IDisposable, Disposable } from '../../../../../base/common/lifecycle.js';

export interface ITypeData {
	text: string;
	replacePrevCharCnt: number;
	replaceNextCharCnt: number;
	positionDelta: number;
}

export class FocusTracker extends Disposable {
	private _isFocused: boolean = false;

	constructor(
		private readonly _domNode: HTMLElement,
		private readonly _onFocusChange: (newFocusValue: boolean) => void,
	) {
		super();
		this._register(addDisposableListener(this._domNode, 'focus', () => {
			this.refreshFocusState();
		}));
		this._register(addDisposableListener(this._domNode, 'blur', () => {
			this._handleFocusedChanged(false);
		}));
	}

	private _handleFocusedChanged(focused: boolean): void {
		if (this._isFocused === focused) {
			return;
		}
		this._isFocused = focused;
		this._onFocusChange(this._isFocused);
	}

	public focus(): void {
		this._domNode.focus();
		this.refreshFocusState();
	}

	public refreshFocusState(): void {

		let activeElement: Element | null = null;
		const shadowRoot = getShadowRoot(this._domNode);
		if (shadowRoot) {
			activeElement = shadowRoot.activeElement;
		} else {
			activeElement = getActiveElement();
		}

		this._handleFocusedChanged(activeElement === this._domNode);
	}

	get isFocused(): boolean {
		return this._isFocused;
	}
}

export function editContextAddDisposableListener<K extends keyof EditContextEventHandlersEventMap>(target: EventTarget, type: K, listener: (this: GlobalEventHandlers, ev: EditContextEventHandlersEventMap[K]) => any, options?: boolean | AddEventListenerOptions): IDisposable {
	target.addEventListener(type, listener as any, options);
	return {
		dispose() {
			target.removeEventListener(type, listener as any);
		}
	};
}
