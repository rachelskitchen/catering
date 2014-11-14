define(['functions'], function() {

    describe('TimeFrm', function() {
        
        it("Constructor", function() {            
            var t;
            
            t = new TimeFrm(2, 0);
            expect(t.get_minutes()).toBe(120);

            t = new TimeFrm(3, 23);
            expect(t.get_minutes()).toBe(203);

            t = new TimeFrm(new Number(3), new Number(17));
            expect(t.get_minutes()).toBe(197);
        });

        it("Get/set minutes", function() {
            var t = new TimeFrm();
            t.set_minutes(127);

            expect(t.get_minutes()).toBe(127);
        });

        it("Load_from_str() - 24hour format", function() {
            var t = new TimeFrm();

            t.load_from_str("12:00");
            expect(t.get_minutes()).toBe(720);

            t.load_from_str("00:00");
            expect(t.get_minutes()).toBe(0);

            t.load_from_str("02:15");
            expect(t.get_minutes()).toBe(135);
        });

        it("Load_from_str() - USA format", function() {
            var t = new TimeFrm(0, 0, 'usa');

            t.load_from_str("1:01am");
            expect(t.get_minutes()).toBe(61);

            t.load_from_str("00:00am");
            expect(t.get_minutes()).toBe(61);

            t.load_from_str("13:00am");
            expect(t.get_minutes()).toBe(61);

            t.load_from_str("11 :00am");
            expect(t.get_minutes()).toBe(61);

            t.load_from_str("11: 00am");
            expect(t.get_minutes()).toBe(61);

            t.load_from_str("11:00xam");
            expect(t.get_minutes()).toBe(61);

            t.load_from_str("2:00 am");
            expect(t.get_minutes()).toBe(120);

            t.load_from_str("12:00am");
            expect(t.get_minutes()).toBe(0);

            t.load_from_str("12:00pm");
            expect(t.get_minutes()).toBe(720);

            t.load_from_str("01:07pm");
            expect(t.get_minutes()).toBe(787);

            t.load_from_str("2:05pm");
            expect(t.get_minutes()).toBe(845);
        });

        it("ToString('24hour')", function() {
            var t = new TimeFrm();

            t.load_from_str("12:00");
            expect(t.toString('24hour')).toBe("12:00");

            t.load_from_str("12:11");
            expect(t.toString('24hour')).toBe("12:11");

            t.load_from_str("00:00");
            expect(t.toString('24hour')).toBe("0:00");

            t.load_from_str("00:25");
            expect(t.toString('24hour')).toBe("0:25");

            t.load_from_str("23:59");
            expect(t.toString('24hour')).toBe("23:59");

            t.load_from_str("04:02");
            expect(t.toString('24hour')).toBe("4:02");

            t.load_from_str("16:13");
            expect(t.toString('24hour')).toBe("16:13");

            t.set_minutes(60 * 24 * 3 + 60 * 2 + 7);
            expect(t.toString('24hour')).toBe("2:07");
        });


        it("ToString('usa')", function() {
            var t = new TimeFrm();

            t.load_from_str("12:00");
            expect(t.toString('usa')).toBe("12:00pm", 'test 12:00' );

            t.load_from_str("12:11");
            expect(t.toString('usa')).toBe("12:11pm", 'test 12:11pm' );

            t.load_from_str("00:00");
            expect(t.toString('usa')).toBe("12:00am", 'test 12:00am' );

            t.load_from_str("00:25");
            expect(t.toString('usa')).toBe("12:25am", 'test 12:25am' );

            t.load_from_str("23:59");
            expect(t.toString('usa')).toBe("11:59pm", 'test 11:59am' );

            t.load_from_str("04:12");
            expect(t.toString('usa')).toBe("4:12am", 'test 4:12am' );

            t.load_from_str("16:13");
            expect(t.toString('usa')).toBe("4:13pm", 'test 4:13pm' );

            t.set_minutes(60 * 24 * 3 + 60 * 2 + 7);
            expect(t.toString('usa')).toBe("2:07am", 'test 3 days + 127 min' );
        });
    });
});

