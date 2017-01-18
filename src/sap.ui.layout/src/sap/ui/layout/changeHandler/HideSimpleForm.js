/*!
 * ${copyright}
 */

sap.ui.define([
	'jquery.sap.global',
	'sap/ui/fl/changeHandler/JsControlTreeModifier'
], function(jQuery, JsControlTreeModifier) {
	"use strict";

	/**
	 * Change handler for hiding of a control.
	 * @alias sap.ui.fl.changeHandler.HideControl
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.27.0
	 */
	var HideForm = { };

	/**
	 * Hides a control.
	 *
	 * @param {sap.ui.fl.Change} oChange change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl control that matches the change selector for applying the change
	 * @param {object} mPropertyBag - map of properties
	 * @returns {boolean} true - if change could be applied
	 * @public
	 */
	HideForm.applyChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;

		var oChangeDefinition = oChange.getDefinition();

		// !important : sHideId was used in 1.40, do not remove for compatibility!
		var oRemovedElement = oModifier.bySelector(oChangeDefinition.content.elementSelector || oChangeDefinition.content.sHideId, oAppComponent, oView);
		var aContent = oModifier.getAggregation(oControl, "content");
		var iStart = -1;

		// this is needed to trigger a refresh of a simpleform! Otherwise simpleForm content and visualization are not in sync
		oModifier.removeAllAggregation(oControl, "content");
		for (var i = 0; i < aContent.length; ++i) {
			oModifier.insertAggregation(oControl, "content", aContent[i], i);
		}

		if (oChangeDefinition.changeType === "hideSimpleFormField") {
			aContent.some(function (oField, index) {
				if (oField === oRemovedElement) {
					iStart = index;
					oModifier.setVisible(oField, false);
				}
				if (iStart >= 0 && index > iStart) {
					if ((oModifier.getControlType(oField) === "sap.m.Label") ||
							(oModifier.getControlType(oField) === "sap.ui.core.Title") ||
							(oModifier.getControlType(oField) === "sap.m.Title") ||
							(oModifier.getControlType(oField) === "sap.m.Toolbar")) {
						return true;
					} else {
						oModifier.setVisible(oField, false);
					}
				}
			});
		} else if (oChangeDefinition.changeType === "removeSimpleFormGroup") {
			var oTitle = oControl.getAggregation("form").getFormContainers()[0].getTitle();
			aContent.some(function (oField, index) {
				if (!oTitle) {
					oModifier.setVisible(oField, false);
				} else {
					if (oField === oRemovedElement) {
						iStart = index;
					}
					if (iStart >= 0 && index > iStart) {
						if ((oModifier.getControlType(oField) === "sap.ui.core.Title") ||
							(oModifier.getControlType(oField) === "sap.m.Title") ||
							(oModifier.getControlType(oField) === "sap.m.Toolbar")) {
							if (iStart === 0) {
								oModifier.removeAggregation(oControl, "content", oField, oView);
								oModifier.insertAggregation(oControl, "content", oField, 0, oView);
							}
							return true;
						} else {
							oModifier.setVisible(oField, false);
						}
					}
				}
			});
			oModifier.removeAggregation(oControl, "content", oRemovedElement, oView);
		}

		return true;
	};

	/**
	 * @param {object} oElement - removedElement
	 * @returns {object} stable element
	 * @private
	 */
	HideForm._getStableElement = function(oElement) {
		if (oElement.getMetadata().getName() === "sap.ui.layout.form.FormContainer") {
			return oElement.getTitle() || oElement.getToolbar();
		} else if (oElement.getMetadata().getName() === "sap.ui.layout.form.FormElement") {
			return oElement.getLabel();
		} else {
			return oElement;
		}
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.oChangeWrapper} oChangeWrapper change object to be completed
	 * @param {object} oSpecificChangeInfo as an empty object since no additional attributes are required for this operation
	 * @param {object} mPropertyBag - map of properties
	 * @param {sap.ui.core.UiComponent} mPropertyBag.appComponent component in which the change should be applied
	 * @public
	 */
	HideForm.completeChangeContent = function(oChangeWrapper, oSpecificChangeInfo, mPropertyBag) {
		var oChange = oChangeWrapper.getDefinition();
		if (oSpecificChangeInfo.removedElement && oSpecificChangeInfo.removedElement.id) {
			var oStableElement = this._getStableElement(sap.ui.getCore().byId(oSpecificChangeInfo.removedElement.id));
			oChange.content.elementSelector = JsControlTreeModifier.getSelector(oStableElement, mPropertyBag.appComponent);
		} else {
			throw new Error("oSpecificChangeInfo.removedElement.id attribute required");
		}
	};

	return HideForm;
},
/* bExport= */true);
