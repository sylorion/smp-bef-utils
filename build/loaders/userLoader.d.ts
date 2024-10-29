import DataLoader from 'dataloader';
export declare function userLoaders(): {
    profiles: DataLoader<string, string[], string>;
    users: DataLoader<string, string[], string>;
};
declare const Loaders: {
    userLoaders: typeof userLoaders;
};
export { Loaders };
