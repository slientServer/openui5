/*globals QUnit*/
jQuery.sap.require("sap.ui.fl.descriptorRelated.internal.Utils");

(function(Utils) {
	'use strict';

	QUnit.module("Utils", {
		beforeEach : function() {
		},
		afterEach : function() {
		}
	});
	
	QUnit.test("getNameAndNameSpace", function(assert) {
		assert.deepEqual(Utils.getNameAndNameSpace("id", "reference"), { 
			"fileName": "manifest",
			"namespace": "apps/reference/changes/id/"
			});
	});

	QUnit.test("checkEntityPropertyChange", function(assert) {
		assert.equal(Utils.checkEntityPropertyChange({
			"entityPropertyChange": {
				"propertyPath": "signature/parameters/id/required",
				"operation": "INSERT",
				"propertyValue": false
			}
		}), undefined);
		assert.equal(Utils.checkEntityPropertyChange({
			"entityPropertyChange": {
				"propertyPath": "signature/parameters/id/required",
				"operation": "UPDATE",
				"propertyValue": false
			}
		}), undefined);
		assert.equal(Utils.checkEntityPropertyChange({
			"entityPropertyChange": {
				"propertyPath": "signature/parameters/id/required",
				"operation": "UPSERT",
				"propertyValue": false
			}
		}), undefined);
		assert.equal(Utils.checkEntityPropertyChange({
			"entityPropertyChange": {
				"propertyPath": "signature/parameters/id/required",
				"operation": "DELETE"
			}
		}), undefined);
	});
	
	QUnit.test("checkEntityPropertyChange failure", function (assert) {
		assert.throws(function(){
			Utils.checkEntityPropertyChange({
				"entityPropertyChange": {
				}
			})
		}.bind(this));
		assert.throws(function(){
			Utils.checkEntityPropertyChange({
				"entityPropertyChange": {
					"propertyPath": "signature/parameters/id/required",
				}
			})
		}.bind(this));
		assert.throws(function(){
			Utils.checkEntityPropertyChange({
				"entityPropertyChange": {
					"propertyPath": "signature/parameters/id/required",
					"operation": "UPSERT"
				}
			})
		}.bind(this));
		assert.throws(function(){
			Utils.checkEntityPropertyChange({
				"entityPropertyChange": {
					"propertyPath": "signature/parameters/id/required",
					"propertyValue": false
				}
			})
		}.bind(this));
		assert.throws(function(){
			Utils.checkEntityPropertyChange({
				"entityPropertyChange": {
					"operation": "UPSERT",
					"propertyValue": false
				}
			})
		}.bind(this));
		assert.throws(function(){
			Utils.checkEntityPropertyChange({
				"entityPropertyChange": {
					"propertyPath": 1,
					"operation": "UPSERT",
					"propertyValue": false
				}
			})
		}.bind(this));
		assert.throws(function(){
			Utils.checkEntityPropertyChange({
				"entityPropertyChange": {
					"propertyPath": "signature/parameters/id/required",
					"operation": "HUGO",
					"propertyValue": false
				}
			})
		}.bind(this));
	});
	
	QUnit.test("checkTexts", function(assert) {
		assert.equal(Utils.checkTexts(), undefined);
		assert.equal(Utils.checkTexts({
			"category": {
				"type": "XTIT",
				"maxLength": 20,
				"comment": "example",
				"value": {
					"": "Category example default text",
					"en": "Category example text in en",
					"de": "Kategorie Beispieltext in de",
					"en_US": "Category example text in en_US"
				}
			}
		}), undefined);
	});
	
	QUnit.test("checkTexts failure", function(assert) {
		assert.throws(function(){
			Utils.checkTexts("wrong type")
		}.bind(this));
	});
	
	
}(sap.ui.fl.descriptorRelated.internal.Utils));
