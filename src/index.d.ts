export {addTrackableProp};
export {deleteTrackableProp};
export {untracked}

declare function addTrackableProp(target: any, propertyName: string, value: any): void;
declare function deleteTrackableProp(target: any, propertyName: string): void;
declare var untracked: {

};