const bindings = require('bindings');

// Carga la librería user32.dll (esta es una biblioteca de Windows)
const user32 = bindings('user32');

// Define la firma de la función EnumWindows
user32.foreignFunction('EnumWindows', ['pointer', 'int32'], 'bool');

// Define la firma de la función GetWindowTextA
user32.foreignFunction('GetWindowTextA', ['int32', 'string', 'int32'], 'int');

// Define la firma de la función IsWindowVisible
user32.foreignFunction('IsWindowVisible', ['int32'], 'bool');

const buffer = Buffer.alloc(512);

// Enumera las ventanas y muestra sus títulos
user32.EnumWindows((wnd, param) => {
    if (user32.IsWindowVisible(wnd)) {
        const length = user32.GetWindowTextA(wnd, buffer, buffer.length);
        if (length > 0) {
            const title = buffer.toString('utf8', 0, length);
            console.log(`Ventana: ${title}`);
        }
    }
    return true;
}, null);
