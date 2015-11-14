var forkFile = require('child_process').fork;
var os_utils = require('os-utils');
var bench;

function startBench(cb) {
    var find_to = document.getElementById('toNumber').value;
    if (!find_to || isNaN(find_to)) return alert('enter number only');
    document.getElementById('start_btn').disabled = true;
    document.getElementById('cancel_btn').disabled = false;
    find_to = Number(find_to);
    bench = forkFile('test-primes-multi.js', [0, find_to]);
    console.log(bench);
    bench.on('message', function(data) {
        if (data.ev == 'start') {
            console.log('starting calculations', data.data);
            document.getElementById('logs').textContent = 'Find Primes From ' + data.data.findFROM + '\n' + 'Find Primes To ' + data.data.findTO + '\n' + 'With CPUS ' + data.data.numCPUs + '\n' + 'Calculating... ';
        } else if (data.ev == 'end') {
            console.log('calculations ended time::', data.data.time);
            document.getElementById('logs').textContent = 'Finished! \n' + 'Time ' + data.data.time.sec;
            bench.send('kill');
            document.getElementById('start_btn').disabled = false;
            document.getElementById('cancel_btn').disabled = true;

        }
    });
    // bench.on('exit', function() {
    //     console.log('exit');
    // })
    // bench.on('close', function() {
    //     console.log('close');
    // })
}

function cancelBench() {
    bench.send('kill');
    document.getElementById('logs').textContent = 'Canceled!';
    document.getElementById('start_btn').disabled = false;
    document.getElementById('cancel_btn').disabled = true;


}
document.getElementById('title').textContent = 'Hello ' + require('os').hostname();
setInterval(function() {
    os_utils.cpuUsage(function(v) {
        document.getElementById('cpu_usage').textContent = (v * 100).toFixed(2);

    });
}, 1000)