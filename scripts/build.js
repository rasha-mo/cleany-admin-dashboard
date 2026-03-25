const { spawnSync } = require('child_process');

const legacyFlag = '--openssl-legacy-provider';
const currentNodeOptions = process.env.NODE_OPTIONS || '';
const mergedNodeOptions = currentNodeOptions.includes(legacyFlag)
    ? currentNodeOptions
    : `${currentNodeOptions} ${legacyFlag}`.trim();

const result = spawnSync(
    process.execPath,
    [require.resolve('react-scripts/scripts/build')],
    {
        stdio: 'inherit',
        env: {
            ...process.env,
            NODE_OPTIONS: mergedNodeOptions,
        },
    },
);

process.exit(result.status === null ? 1 : result.status);
