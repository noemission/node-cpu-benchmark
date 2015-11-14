function Timer() {
    this.time = process.hrtime();
}
Timer.prototype.end = function() {
    var diff = process.hrtime(this.time);
    diff = diff[0] * 1e9 + diff[1];
    return {
        nano: diff,
        milli: diff / 1000000,
        sec: diff / 1000000000
    }
};

function bench() {
    var time = process.hrtime();
    var arr = [];
    for (var i = 0; i < 1000000; i++) {
        arr.push(i)
    };
    for (var i = 0; i < 1000000; i++) {
        arr[i];
        for (var j = 0; j < 1000000; j++) {
            arr[i];

        };

    };
    var diff = process.hrtime(time);
    var b_arr = diff[0] * 1e9 + diff[1];

    return b_arr;
}

function merge(arr1, arr2) {
    if (!arr1 && !arr2) return [];
    if (!arr2) return arr1;
    if (!arr1) return arr2;
    var to_return = [];
    var c1 = 0;
    var c2 = 0;
    do {
        if (arr1[c1] < arr2[c2]) {
            to_return.push(arr1[c1]);
            c1++;
        } else {
            to_return.push(arr2[c2]);
            c2++;
        }
    } while (c1 < arr1.length && c2 < arr2.length);
    if (c1 < arr1.length) to_return.push.apply(to_return, arr1.slice(c1));
    if (c2 < arr2.length) to_return.push.apply(to_return, arr2.slice(c2));
    return to_return;

}

function c_sort(arr) {
    if (arr.length == 2) {
        return arr[0] > arr[1] ? [arr[1], arr[0]] : [arr[0], arr[1]];
    } else if (arr.length == 1) {
        return arr;
    }
}

function merge_sort(arr) {
    if (arr.length > 4) {
        var l = arr.length
        return merge(merge_sort(arr.splice(0, l / 2)), merge_sort(arr));
    } else {
        return merge(c_sort(arr.splice(0, 2)), c_sort(arr.splice(0, 2)))
    }


}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
// var arr = [];

// 	for(var i=1500;i>0;i--){
// 		arr.push(getRandomInt(0,1500));
// 	}
// 	var arr2 = _.clone(arr);

// 	time = process.hrtime();
// 	var x = arr2.sort(function(a, b) {
//   return a - b;
// });
// var diff1 = process.hrtime(time);
// 	diff1 = diff1[0] * 1e9 + diff1[1]
// 	console.log('default took:'+diff1);
// 	var time = process.hrtime();
// 	var y = merge_sort(arr);
// var diff2 = process.hrtime(time);
// 	diff2 = diff2[0] * 1e9 + diff2[1];
// 	console.log('merge took:'+diff2);
// 	var res = true;
// 	for (var i = 0; i < x.length; i++) {
// 		if(x[i]!=y[i]){
// 			res = false;
// 			break;
// 		}
// 	};
// 	console.log('def:',res);
// 	console.log("winner " + (diff1>diff2 ? 'merge' : 'def'))


function find_primes(from, to) {
    from = Number(from);
    to = Number(to);
    var prm = [];
    for (var i = from; i < to; i++) {
        if (check_prime(i)) {
            prm.push(i)
        }
    };
    return prm
}

function check_prime(num) {
    for (var i = 2; i <= Math.sqrt(num); i++) {
        if (num % i == 0) return false;
    };
    return true;
}



var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var fs = require('fs');
var procs = [];

if (cluster.isMaster) {
    // Fork workers.
    var file = fs.createWriteStream('myExample.txt');
    file.write("2,3,");
    if (process.argv.length != 4) process.exit();
    var findTO = Number(process.argv[process.argv.length - 1]) || 10;
    var findFROM = Number(process.argv[process.argv.length - 2]) || 0;
    var find = findTO - findFROM;
    process.send({
        ev: "start",
        data: {
            numCPUs: numCPUs,
            findFROM: findFROM,
            findTO: findTO
        }
    })
    process.on("message", function(ev) {
        if (ev == 'kill') {
            procs.forEach(function(p) {
                console.log(p.process.pid);
                process.kill(p.process.pid);
            })
            process.exit();
        }
    })
    console.log('finding :' + findFROM + '--' + findTO + ' first primes with :' + numCPUs + ' cpus');
    var timer = new Timer();
    for (var i = 0; i < numCPUs; i++) {

        var prms = [];
        var dis = 0;

        proc = cluster.fork({
            from: findFROM + Math.floor(find / numCPUs * (i)),
            to: findFROM + Math.floor(find / numCPUs * (i + 1))
        });
        procs.push(proc);

        proc.on('message', function(data) {
            file.write(data.toString() + ",");
        });
        proc.on('disconnect', function() {
            dis++;
            if (dis == numCPUs) {
                var res = timer.end();
                file.end()
                process.send({
                    ev: "end",
                    data: {
                        time: res
                    }
                })
                console.log('primes took:' + res.nano + ' nano');
                console.log('primes took:' + res.milli + ' milli');
                console.log('primes took:' + res.sec + ' sec');
                process.exit();
            }
        });
        //console.log(i*(arr.length/numCPUs),(arr.length/numCPUs)*(i+1))
        //cluster.fork({a:arr.splice(i*(arr.length/numCPUs),(arr.length/numCPUs)*(i+1))});
    }


} else {
    // Workers can share any TCP connection
    // In this case its a HTTP server
    //bench()
    console.log('i begin', cluster.worker.id)
    process.send(find_primes(process.env.from, process.env.to))
    process.disconnect();
}