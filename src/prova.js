const regedit = require('regedit')

/*
const registryPath = 'HKLM\\SOFTWARE\\Policies\\BraveSoftware\\Brave-Browser';

regedit.list([registryPath], function(err, result) {
    if (err) {
        console.log(err);
        return;
    }
    console.log(result);
})
*/

const registryPath = 'HKLM\\SOFTWARE\\Policies\\BraveSoftware\\Brave-Browser\\ExtensionInstallForcelist';
const extensionId = 'fiphpbkbalgfpgdnblppmpbfdbbcancf';

const exc = async ()=>{


    const directories = [
        'HKLM\\SOFTWARE\\Policies\\BraveSoftware',
        'HKLM\\SOFTWARE\\Policies\\BraveSoftware\\Brave-Browser',
    ];

    for (const dir of directories) {
        await regedit.createKey(dir, (err) => {
            if (err) {
                console.log('Error:', err);
            } else {
                console.log(`Directory ${dir} created.`);
            }
        });
    }


    await regedit.putValue({
        [registryPath]: {
            '1': {
                value: extensionId,
                type: 'REG_SZ'
            }
        }
    }, (err) => {
        if (err) {
            console.log('Error:', err);
        } else {
            console.log(`Extension with ID ${extensionId} added to ExtensionInstallForcelist.`);
        }
    });
}

exc();
