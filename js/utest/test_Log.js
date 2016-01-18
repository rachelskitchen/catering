define(['log'], function() {
    'use strict';

    describe('App.Models.Log', function() {
        var model, def, msg;

        beforeEach(function() {
            model = new App.Models.Log();
            def = {
                timeout: 2000,
                messages: []
            },
            msg = {
                logType: 'Error',
                message: 'some message',
                file: 'some file',
                line: 'some line'
            };
        });

        it('Environment', function() {
            expect(App.Models.Log).toBeDefined();
        });

        it('Create model', function() {
            expect(model.toJSON()).toEqual(def);
        });

        it('initialize()', function() {
            spyOn(App.Models.Log.prototype, 'sendLog');
            spyOn(App.Models.Log.prototype, 'pushJSError');

            var opts = {init: [msg]};
            model = new App.Models.Log(opts);

            expect(model.sendLog).toHaveBeenCalled();
            expect(model.pushJSError).toHaveBeenCalledWith('some message', 'some file', 'some line');
            expect(model.init).toBeUndefined();
        });

        describe('push()', function() {
            beforeEach(function() {
                spyOn(model, 'sendLog');
                spyOn(model, 'getMeta').and.returnValue('meta');
            });

            it('try is successful', function() {
                model.push('Error', msg);
                expect(model.get('messages')).toEqual([JSON.stringify({
                    type: 'Error',
                    data: msg,
                    meta: 'meta'
                })]);
                expect(model.sendLog).toHaveBeenCalled();
            });
        });

        it('pushJSError', function() {
            spyOn(model, 'push');
            model.pushJSError('message', 'file', 'line');
            expect(model.push).toHaveBeenCalledWith('Error', {
                type: 'JS Runtime',
                message: 'message',
                file: 'file',
                line: 'line'
            });
        });

        it('pushAjaxError', function() {
            spyOn(model, 'push');
            model.pushAjaxError('url', 'state', 'message');
            expect(model.push).toHaveBeenCalledWith('Error', {
                type: 'Ajax Request',
                url: 'url',
                state: 'state',
                message: 'message'
            });
        });

        it('pushImageError', function() {
            spyOn(model, 'push');
            model.pushImageError('url');
            expect(model.push).toHaveBeenCalledWith('Error', {
                type: 'Image load',
                url: 'url'
            });
        });

        it('sendLog()', function() {
            spyOn(window, 'setTimeout').and.callFake(function(cb) {cb();});
            spyOn(console, 'log');
            model.set('messages', []);
            model.sendLog();
            expect(console.log).not.toHaveBeenCalled();

            model.set('messages', ['message1', 'message2']);
            model.sendLog();
            expect(console.log).toHaveBeenCalledWith(['message1', 'message2']);
            expect(model.get('messages')).toEqual([]);
        });

    });
});