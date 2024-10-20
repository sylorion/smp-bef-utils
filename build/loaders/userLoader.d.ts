import DataLoader from 'dataloader';
export declare function createUserLoaders(): {
    profiles: DataLoader<string, string[], string>;
    users: DataLoader<string, string[], string>;
};
declare const Loaders: {
    createUserLoaders: typeof createUserLoaders;
};
export { Loaders };
