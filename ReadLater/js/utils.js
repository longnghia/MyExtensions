
/*  
declare before other js

*/


function showToast(text = 'Success!', icon = 'success', timer = 1500) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: timer,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })
    Toast.fire({
        icon: icon,
        title: text
    })
}



/* 
shortcuts
*/
let shortcuts = {
    'ctrlKey': {
        'x': function () { },
        's': () => { }
    },
    'shiftKey': {
        'x': function () { },
        's': () => { }
    },
    'single': {
        'x': function () { },
        's': () => { }
    }
}
function addShortCut(exclude = '', callback) {

    window.addEventListener("keydown",
        function (event) {
            if (exclude) {
                if (event.target.tagName?.toUpperCase() === exclude)
                    return
            }
            if (event.ctrlKey) {
                switch (event.key) {
                    case 's':
                        event.preventDefault();
                        callback()
                        break;
                    default:
                        return;
                }
            }
        }, true
    );
}

