'use strict';

/**
 * @namespace Account
 */

var server = require('server');
var superModule = module.superModule;
var page = module.superModule;
server.extend(page);
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

/**
 * Checks if the email value entered is correct format
 * @param {string} email - email string to check if valid
 * @returns {boolean} Whether email is valid
 */
function validateEmail(email) {
    var regex = /^[\w.%+-]+@[\w.-]+\.[\w]{2,6}$/;
    return regex.test(email);
}

/**
 * Account-SendResetPin : The Account-SendResetPin endpoint is the endpoint that gets hit once the shopper has clicked forgot password and has submitted their email address to request to reset their password
 * @name Base/Account-SendResetPin
 * @function
 * @memberof Account
 * @param {middleware} - server.middleware.https
 * @param {querystringparameter} - mobile - a flag determining whether or not the shopper is on a mobile sized screen
 * @param {httpparameter} - loginEmail - Input field, the shopper's email address
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.post('SendResetPin', server.middleware.https, function (req, res, next) {
    var passwordForm = server.forms.getForm('newPasswords');

    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Resource = require('dw/web/Resource');
    var URLUtils = require('dw/web/URLUtils');
    var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');
    var pin = Math.floor(Math.random() * 90000) + 100000;
    var email = req.form.loginEmail;
    var errorMsg;
    var isValid;
    var resettingCustomer;
    var mobile = req.querystring.mobile;
    var receivedMsgHeading = Resource.msg('label.resetpasswordreceived', 'login', null);
    var receivedMsgBody = Resource.msg('msg.pin', 'login', null);
    var inputMsgBody = '<input type="text" id="pin" name="pin" placeholder="Enter PIN Here ">';
    var buttonText = Resource.msg('button.text.pin', 'login', null);
    var returnUrl = URLUtils.url('Account-ValidateResetPin').toString();
    var controlModal = false;
    var pinForm = req.form.resetPin;
    var pinFormNumber = pinForm;
    var passwordResetPinObject;
    var date = new Date;
    var dateToString = date.toString();
    var createCustomObjPIn;
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var Transaction = require('dw/system/Transaction');
    var pinNumber = Math.floor(Math.random() * 90000) + 100000
    var isPinExpired
    var pinPreferencetime = dw.system.Site.getCurrent().getCustomPreferenceValue('resetPinTimeToLive');
    var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');
    var attributeContext = { product: pinNumber };
    var attributeTemplate = 'account/password/passwordResetPinForm';
    var pinFormHtml = renderTemplateHelper.getRenderedHtml(
        attributeContext,
        attributeTemplate
    );

    Transaction.wrap(function () {
        if (empty(CustomObjectMgr.getCustomObject('passwordResetPin', email))) {
            createCustomObjPIn = CustomObjectMgr.createCustomObject('passwordResetPin', email);
            passwordResetPinObject = CustomObjectMgr.getCustomObject('passwordResetPin', email);
            passwordResetPinObject.custom.pinOject = email;
            passwordResetPinObject.custom.pinNumber = pinNumber.toString();
            passwordResetPinObject.custom.pinTime = dateToString;
        }

        passwordResetPinObject = CustomObjectMgr.getCustomObject('passwordResetPin', email);

        if (passwordResetPinObject && passwordResetPinObject.custom.pinTime) {
            var custoObjectTime = passwordResetPinObject.custom.pinTime;
            var timeToLive = new Date(custoObjectTime).getTime() + Number(pinPreferencetime) * 60000;
            var currentTime = date.getTime();
            isPinExpired = currentTime >= timeToLive;
        }

        if (isPinExpired) {
            passwordResetPinObject.custom.pinNumber = pinNumber.toString();
            passwordResetPinObject.custom.pinTime = dateToString;
        }
    });

    if (email) {
        isValid = validateEmail(email);
        if (isValid) {
            resettingCustomer = CustomerMgr.getCustomerByLogin(email);
            if (resettingCustomer) {
                accountHelpers.sendResetPinEmail(email, resettingCustomer);

            }

            res.json({
                success: true,
                pinFormHtml: pinFormHtml,
                emailData: email,
                receivedMsgHeading: receivedMsgHeading,
                receivedMsgBody: receivedMsgBody,
                buttonText: buttonText,
                mobile: mobile === 'true',
                controlModal: controlModal,
                inputMsgBody: inputMsgBody,
                returnUrl: returnUrl
            });
        } else {
            errorMsg = Resource.msg('error.message.passwordreset', 'login', null);
            res.json({
                fields: {
                    loginEmail: errorMsg
                }
            });
        }
    } else {
        errorMsg = Resource.msg('error.message.required', 'login', null);
        res.json({
            fields: {
                loginEmail: errorMsg
            }
        });
    }
    next();
});

/**
 * Account-ValidateResetPin : The Account-ValidateResetPin endpoint is the endpoint that gets hit once the shopper has clicked forgot password and has submitted their email address to request to reset their password
 * @name Base/Account-ValidateResetPin
 * @function
 * @memberof Account
 * @param {middleware} - server.middleware.https
 * @param {querystringparameter} - mobile - a flag determining whether or not the shopper is on a mobile sized screen
 * @param {httpparameter} - loginEmail - Input field, the shopper's email address
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.post('ValidateResetPin', server.middleware.https, function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Resource = require('dw/web/Resource');
    var URLUtils = require('dw/web/URLUtils');
    var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');
    var pin = Math.floor(Math.random() * 90000) + 100000;
    var isPinValid = true;
    var pinForm = req.form.resetPin;
    var pinFormNumber = pinForm;
    var email = req.form.loginEmail;
    var passwordResetPinObject;
    var date = new Date;
    var dateToString = date.toString();
    var createCustomObjPIn;
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var Transaction = require('dw/system/Transaction');
    var customObjPin;
    Transaction.wrap(function () {
        if (empty(CustomObjectMgr.getCustomObject('passwordResetPin', email))) {
            createCustomObjPIn = CustomObjectMgr.createCustomObject('passwordResetPin', email);
            passwordResetPinObject = CustomObjectMgr.getCustomObject('passwordResetPin', email);
            passwordResetPinObject.custom.pinOject = email;
            passwordResetPinObject.custom.pinNumber = Math.floor(Math.random() * 90000) + 100000;
            passwordResetPinObject.custom.pinTime = dateToString;
        }
        passwordResetPinObject = CustomObjectMgr.getCustomObject('passwordResetPin', email);
        customObjPin = passwordResetPinObject.custom.pinNumber;
    });
    var errorMsg;
    var isValid;
    var resettingCustomer;
    var mobile = req.querystring.mobile;
    var receivedMsgHeading = Resource.msg('label.resetpasswordreceived', 'login', null);
    var receivedMsgBody = Resource.msg('msg.pin.success', 'login', null);
    var buttonText = Resource.msg('button.text.loginform', 'login', null);
    var returnUrl = URLUtils.url('Account-DisplayResetForm').toString();
    var pinFormHtml = '';

    if (pinFormNumber && (customObjPin === pinFormNumber)) {
        isValid = validateEmail(email);
        if (isValid) {
            resettingCustomer = CustomerMgr.getCustomerByLogin(email);
            if (resettingCustomer) {
                accountHelpers.sendPasswordResetEmail(email, resettingCustomer);
                var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');
                var attributeTemplate = 'account/password/newPasswordForm';
                var passwordResetToken = getPasswordResetToken(resettingCustomer);
                var passwordForm = server.forms.getForm('newPasswords');
                passwordForm.clear();
                // attributeContext holds the pdict data
                var attributeContext = {
                    token: passwordResetToken,
                    passwordForm: passwordForm
                }
                pinFormHtml = renderTemplateHelper.getRenderedHtml(
                    attributeContext,
                    attributeTemplate
                );
            }
            res.json({
                success: true,
                receivedMsgHeading: receivedMsgHeading,
                receivedMsgBody: receivedMsgBody,
                buttonText: buttonText,
                clearButton: true,
                mobile: mobile === 'true',
                returnUrl: returnUrl,
                pinFormHtml: pinFormHtml
            });
        } else {
            errorMsg = Resource.msg('error.message.pin', 'login', null);
            res.json({
                fields: {
                    loginEmail: errorMsg
                }
            });
        }
    } else {
        errorMsg = Resource.msg('error.message.pin', 'login', null);
        res.json({
            fields: {
                loginEmail: errorMsg
            }
        });
    }
    next();
});

/**
 * Account-SaveNewPassword : The Account-SaveNewPassword endpoint handles resetting a shoppers password. This is the last step in the forgot password user flow. (This step does not log the shopper in.)
 * @name Base/Account-SaveNewPassword
 * @function
 * @memberof Account
 * @param {middleware} - server.middleware.https
 * @param {querystringparameter} - Token - SFRA utilizes this token to retrieve the shopper
 * @param {httpparameter} - dwfrm_newPasswords_newpassword - Input field for the shopper's new password
 * @param {httpparameter} - F  - Input field to confirm the shopper's new password
 * @param {httpparameter} - save - unutilized param
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - post
 */
server.post('DisplayResetForm', server.middleware.https, function (req, res, next) {
    var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');
    var attributeTemplate = 'account/password/newPasswordForm';
    var passwordResetToken = getPasswordResetToken(resettingCustomer);
    var passwordForm = server.forms.getForm('newPasswords');

    // attributeContext holds the pdict data
    var attributeContext = {
        token: passwordResetToken
    }
    pinFormHtml = renderTemplateHelper.getRenderedHtml(
        attributeContext,
        attributeTemplate
    );
    res.json({
        pinFormHtml: pinFormHtml
    });
    next();
});

function getPasswordResetToken(customer) {
    var Transaction = require('dw/system/Transaction');

    var passwordResetToken;
    Transaction.wrap(function () {
        passwordResetToken = customer.profile.credentials.createResetPasswordToken();
    });
    return passwordResetToken;
}

module.exports = server.exports();
