window.Event = new Vue();

Vue.component('command', {
    props: {
        title: { required: true },
        icon: { required: true }
    },
    data() {
        return {
            command: "sudo chmod",
            user: 7,
            group: 7,
            others: 5,
            content: 'file.txt'
        }
    },
    mounted() {
        Event.$on('update_permission', (payload) => {
            if (payload.type === 'user')
                this.user = payload.value
            else if (payload.type === 'group')
                this.group = payload.value
            else
                this.others = payload.value
        })
        Event.$on('content_changed', (payload) => {
            if (payload.content === 'folder')
                this.content = '-R folder'
            else if (payload.content === 'file')
                this.content = 'file.txt'
        })
    },
    computed: {
        makeCommand() {
            return `${this.command} ${this.user}${this.group}${this.others} ${this.content}`
        }
    },
    template: `
	<div class="box">
		<div class="columns">
			<div class="column is-narrow">
				<span class="icon" style="margin-top:15px;">
				  <i class="fa-3x" :class="icon"></i>
				</span>
			</div>
			<div class="column">
				<strong>{{ title }}</strong>
				<br>
				<p class="is-family-code">
					{{ makeCommand }}
				</p>
			</div>
		</div>
	</div>
	`
})

Vue.component('file-type', {
    props: {
        selected: { required: true }
    },
    data() {
        return {
            type: ''
        }
    },
    created() {
        this.type = this.$props.selected;
    },
    methods: {
        onContentChange() {
            Event.$emit('content_changed', { content: this.type });
        }
    },
    template: `
	<div class="column box is-5">
        <h1 class="title">Permission for</h1>
        <div class="control" @change="onContentChange">
            <label class="radio">
                <input type="radio" name="content" value="file" v-model="type">
                File
            </label>
            <label class="radio">
                <input type="radio" name="content" value="folder" v-model="type">
                Folder
            </label>
        </div>
    </div>
	`
})

Vue.component('permission', {
    props: {
        type: { required: true },
        name: { required: true },
        value: { required: true },
        check: Boolean
    },
    data() {
        return {
            checked: true,
        }
    },
    created() {
        this.checked = this.$props.check;
    },
    methods: {
        singlePermissionChange() {
            Event.$emit('single_permission_change', { type: this.$props.type, name: this.$props.name, checked: this.checked })
        }
    },
    template: `
	<li>
		<label class="checkbox">
			<input type="checkbox" v-model="checked" @change="singlePermissionChange">
			{{ name }}
		</label>
	</li>
	`
});

Vue.component('permissions', {
    props: {
        name: { required: true },
    },
    data() {
        return {
            permission_value: 0,
            permissions: [
                { name: 'Read', checked: true, value: 4 },
                { name: 'Write', checked: false, value: 2 },
                { name: 'Execute', checked: true, value: 1 },
            ]
        }
    },
    created() {
        if (this.$props.name === 'User' || this.$props.name === 'Group') {
            this.permissions = this.permissions.map(permission => {
                permission.checked = true;
                return permission;
            })
        }
        this.calculatePermission();
    },
    mounted() {
        Event.$on('single_permission_change', (payload) => {
            this.onPermissionChange(payload);
        })
    },
    computed: {
        getType() {
            return this.$props.name.toLowerCase();
        }
    },
    methods: {
        calculatePermission() {
            let value = 0;
            this.permissions.forEach(permission => {
                if (permission.checked == true)
                    value += permission.value;
            })
            this.permission_value = value;
        },
        onPermissionChange(payload) {
            if (payload.type === this.$props.name.toLowerCase()) {
                this.permissions = this.permissions.map(permission => {
                    if (permission.name === payload.name) {
                        permission.checked = payload.checked;
                    }
                    return permission;
                })
                this.calculatePermission();
                Event.$emit('update_permission', { type: this.getType, value: this.permission_value })
            }
        }
    },
    template: `
	<div class="column box is-narrow permission-block">
		<h1 class="title">{{ name }}</h1>
		<ul>
			<permission v-for="per in permissions" :key="per.id" :type="getType" :name="per.name" :check="per.checked" :value="per.value"></permission>
		</ul>
	</div>
	`
})

new Vue({
    el: '#root',
});